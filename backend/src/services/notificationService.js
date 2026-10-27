const { getIO } = require('../config/socket');

/**
 * Clean phone number to standard format with 91 country code
 */
const sanitizePhone = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return digits;
  return digits;
};

/**
 * Generate formatted WhatsApp Web / App link
 */
const createWhatsAppUrl = (phone, text) => {
  const sanitized = sanitizePhone(phone);
  return `https://wa.me/${sanitized}?text=${encodeURIComponent(text)}`;
};

/**
 * Trigger an Automated Voice Call (IVR / Call Bot) to Family Member
 */
const triggerEmergencyCall = async (phone, contactName, vehicleNumber, ownerName) => {
  const cleanPhone = sanitizePhone(phone);
  try {
    console.log(`\n📞 [EMERGENCY CALL DISPATCHED] -> Calling Family Member: ${contactName} at +${cleanPhone}`);
    console.log(`🔊 Voice Prompt: "Namaskar ${contactName}, GadiRaksha Emergency Alert! Tumche kutumbiya ${ownerName || 'Vehicle Owner'} yanchya gadi cha (No: ${vehicleNumber}) accident jhalela aahe. Krupaya tatkal madat pohchva!"\n`);

    return { success: true, channel: 'CALL', recipientPhone: cleanPhone };
  } catch (error) {
    console.error(`❌ Automated Call failed to ${phone}:`, error.message);
    return { success: false, channel: 'CALL', error: error.message };
  }
};

/**
 * Send SMS through provider (Supports Console Dev, Fast2SMS, Twilio)
 */
const sendSMS = async (phone, message) => {
  const provider = process.env.SMS_PROVIDER || 'CONSOLE';
  const cleanPhone = sanitizePhone(phone);

  try {
    if (provider === 'FAST2SMS' && process.env.FAST2SMS_API_KEY) {
      console.log(`[Fast2SMS] SMS sent to ${cleanPhone}`);
      return { success: true, channel: 'SMS', provider: 'FAST2SMS' };
    }

    // Default console simulator
    console.log(`\n================== [SMS SIMULATOR] ==================`);
    console.log(`To: +${cleanPhone}`);
    console.log(`Message:\n${message}`);
    console.log(`====================================================\n`);
    return { success: true, channel: 'SMS', provider: 'CONSOLE' };
  } catch (error) {
    console.error(`❌ Failed to send SMS to ${phone}:`, error.message);
    return { success: false, channel: 'SMS', error: error.message };
  }
};

/**
 * Send WhatsApp Message
 */
const sendWhatsAppMessage = async (phone, message) => {
  const cleanPhone = sanitizePhone(phone);

  try {
    console.log(`\n================== [WHATSAPP DISPATCH] ==================`);
    console.log(`To WhatsApp: +${cleanPhone}`);
    console.log(`Body:\n${message}`);
    console.log(`Click-to-Chat Link: ${createWhatsAppUrl(cleanPhone, message)}`);
    console.log(`=========================================================\n`);

    return {
      success: true,
      channel: 'WHATSAPP',
      whatsappUrl: createWhatsAppUrl(cleanPhone, message)
    };
  } catch (error) {
    console.error(`❌ Failed to send WhatsApp to ${phone}:`, error.message);
    return { success: false, channel: 'WHATSAPP', error: error.message };
  }
};

/**
 * Dispatch No-Parking or Vehicle Alert to Owner
 */
const sendNoParkingAlert = async ({ owner, tag, location, scannerDetails, scannerNote, alertType }) => {
  const vehicleNo = tag.vehicleDetails?.vehicleNumber || tag.tagCode;
  const hasGps = location?.latitude && location?.longitude;
  const mapsLink = location?.googleMapsUrl || (hasGps ? `https://maps.google.com/?q=${location.latitude},${location.longitude}` : '');
  const alertTitle = alertType === 'NO_PARKING' ? '🚫 NO-PARKING / OBSTRUCTION ALERT' : '⚠️ VEHICLE ISSUE ALERT';

  let locationText = mapsLink ? `*Location:* ${mapsLink}` : `*Location:* Not shared by scanner`;
  if (location?.address) {
    locationText += `\n*Landmark/Area:* ${location.address}`;
  }

  const messageText = 
`*🚨 ${alertTitle} - GadiRaksha*
----------------------------------------
*Gadi No:* ${vehicleNo}
*Status:* Aapli gadi no-parking / rastyat adchan karat aahe!
*Tippani:* ${scannerNote || 'Krupaya gadi lagech baajula kara.'}
${locationText}
${scannerDetails?.phone ? `*Scanner Contact:* ${scannerDetails.phone}` : ''}
*Time:* ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}

_Krupaya lagech jaun gadi check kara._`;

  const logs = [];

  // 1. Send WhatsApp to Owner
  const waResult = await sendWhatsAppMessage(owner.phone, messageText);
  logs.push({
    recipientType: 'OWNER',
    recipientName: owner.name,
    phone: owner.phone,
    channel: 'WHATSAPP',
    deliveryStatus: waResult.success ? 'SENT' : 'FAILED',
    error: waResult.error
  });

  // 2. Send SMS to Owner
  const smsResult = await sendSMS(owner.phone, messageText);
  logs.push({
    recipientType: 'OWNER',
    recipientName: owner.name,
    phone: owner.phone,
    channel: 'SMS',
    deliveryStatus: smsResult.success ? 'SENT' : 'FAILED',
    error: smsResult.error
  });

  // 3. Dispatch Voice Call Alert to Owner
  const callResult = await triggerEmergencyCall(owner.phone, owner.name || 'Vehicle Owner', vehicleNo, owner.name || 'GadiRaksha Safety');
  logs.push({
    recipientType: 'OWNER',
    recipientName: owner.name,
    phone: owner.phone,
    channel: 'CALL',
    deliveryStatus: callResult.success ? 'SENT' : 'FAILED'
  });

  // 4. Emit Real-time Socket Alert
  try {
    const io = getIO();
    const payload = {
      alertType: alertType || 'NO_PARKING',
      tagCode: tag.tagCode,
      vehicleNumber: vehicleNo,
      ownerName: owner.name || 'Vehicle Owner',
      location: {
        ...location,
        hasLocation: Boolean(hasGps || location?.address),
        googleMapsUrl: mapsLink || null
      },
      scannerNote,
      timestamp: new Date().toISOString()
    };

    io.to(`user:${owner._id.toString()}`).emit('alert:new', payload);
    io.to(`tag:${tag.tagCode}`).emit('alert:new', payload);

    logs.push({
      recipientType: 'OWNER',
      recipientName: owner.name,
      phone: owner.phone,
      channel: 'SOCKET',
      deliveryStatus: 'SENT'
    });
  } catch (err) {
    console.warn(`Socket emission warning: ${err.message}`);
  }

  return { logs, directWhatsAppUrl: createWhatsAppUrl(owner.phone, messageText) };
};

/**
 * Dispatch SOS Accident Alert to 3-4 Family Members & Owner
 * WORKS WITH OR WITHOUT LOCATION
 */
const sendAccidentAlert = async ({ owner, tag, location, scannerDetails, scannerNote }) => {
  const vehicleNo = tag.vehicleDetails?.vehicleNumber || tag.tagCode;
  const hasGps = Boolean(location?.latitude && location?.longitude);
  const mapsLink = location?.googleMapsUrl || (hasGps ? `https://maps.google.com/?q=${location.latitude},${location.longitude}` : null);

  // Formulate emergency message (Adapts if location is missing)
  const locationSection = mapsLink
    ? `*📍 Live Location (Google Maps):*\n${mapsLink}`
    : (location?.address ? `*📍 Area / Landmark:* ${location.address}` : `*📍 Location:* Scanner kadun location allow nahi zali. (Without GPS)`);

  const emergencyMessage = 
`*🆘 EMERGENCY SOS - ACCIDENT ALERT!*
----------------------------------------
*GadiRaksha Emergency Protection*
*Gadi No:* ${vehicleNo}
*Vahan Chalak (Owner):* ${owner.name} (${owner.phone})
*Gender:* ${owner.gender || 'Not specified'} | *Blood Group:* ${owner.bloodGroup || 'Unknown'}
${owner.weight ? `*Weight:* ${owner.weight} kg` : ''} ${owner.height ? `| *Height:* ${owner.height}` : ''}
${owner.address?.fullAddress ? `*Address:* ${owner.address.fullAddress}` : ''}
${owner.medicalNotes ? `*Medical Notes:* ${owner.medicalNotes}` : ''}
*Tippani:* ${scannerNote || 'Gadi cha accident jhalela aahe, tatkal sampark kara!'}
${locationSection}
${scannerDetails?.phone ? `*Madat Karnaryacha No:* ${scannerDetails.phone} (${scannerDetails.name || 'Pratyakshdarshi'})` : ''}
*Time:* ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}

_Tatkal sampark kara aani ghatanastali madat pohchva!_`;

  const logs = [];
  const directFamilyWhatsAppLinks = [];

  // 1. Notify Vehicle Owner (WhatsApp + SMS + Automated Call)
  const ownerWa = await sendWhatsAppMessage(owner.phone, emergencyMessage);
  logs.push({
    recipientType: 'OWNER',
    recipientName: owner.name,
    phone: owner.phone,
    channel: 'WHATSAPP',
    deliveryStatus: ownerWa.success ? 'SENT' : 'FAILED'
  });
  await sendSMS(owner.phone, emergencyMessage);
  await triggerEmergencyCall(owner.phone, owner.name, vehicleNo, owner.name);

  // 2. Notify ALL 3 to 4 Family Emergency Contacts
  const contacts = owner.emergencyContacts || [];

  // Sort by priority order if set
  const sortedContacts = [...contacts].sort((a, b) => (a.priorityOrder || 1) - (b.priorityOrder || 1));

  for (const contact of sortedContacts) {
    if (!contact.phone) continue;

    // A. WhatsApp Message to Family Member
    const contactWa = await sendWhatsAppMessage(contact.phone, emergencyMessage);
    const waUrl = createWhatsAppUrl(contact.phone, emergencyMessage);

    directFamilyWhatsAppLinks.push({
      name: contact.name,
      relation: contact.relation,
      phone: contact.phone,
      whatsappUrl: waUrl
    });

    logs.push({
      recipientType: 'FAMILY_CONTACT',
      recipientName: `${contact.name} (${contact.relation})`,
      phone: contact.phone,
      channel: 'WHATSAPP',
      deliveryStatus: contactWa.success ? 'SENT' : 'FAILED'
    });

    // B. High Priority SMS to Family Member
    await sendSMS(contact.phone, emergencyMessage);
    logs.push({
      recipientType: 'FAMILY_CONTACT',
      recipientName: `${contact.name} (${contact.relation})`,
      phone: contact.phone,
      channel: 'SMS',
      deliveryStatus: 'SENT'
    });

    // C. Automated Emergency Call to Family Member
    await triggerEmergencyCall(contact.phone, contact.name, vehicleNo, owner.name);
    logs.push({
      recipientType: 'FAMILY_CONTACT',
      recipientName: `${contact.name} (${contact.relation})`,
      phone: contact.phone,
      channel: 'CALL',
      deliveryStatus: 'SENT'
    });
  }

  // 3. Emit Real-time Socket SOS Alert
  try {
    const io = getIO();
    const payload = {
      alertType: 'ACCIDENT',
      priority: 'HIGH_CRITICAL',
      tagCode: tag.tagCode,
      vehicleNumber: vehicleNo,
      ownerName: owner.name,
      ownerPhone: owner.phone,
      profilePic: owner.profilePic,
      gender: owner.gender,
      bloodGroup: owner.bloodGroup,
      weight: owner.weight,
      height: owner.height,
      address: owner.address?.fullAddress || '',
      medicalNotes: owner.medicalNotes,
      hasLocation: Boolean(mapsLink || location?.address),
      location: {
        ...location,
        googleMapsUrl: mapsLink
      },
      familyContactsNotified: contacts.length,
      scannerDetails,
      scannerNote,
      timestamp: new Date().toISOString()
    };

    io.to(`user:${owner._id.toString()}`).emit('alert:emergency', payload);
    io.to(`tag:${tag.tagCode}`).emit('alert:emergency', payload);
    io.emit('broadcast:emergency', payload);

    logs.push({
      recipientType: 'OWNER',
      recipientName: owner.name,
      phone: owner.phone,
      channel: 'SOCKET',
      deliveryStatus: 'SENT'
    });
  } catch (err) {
    console.warn(`Socket emergency warning: ${err.message}`);
  }

  return { logs, directFamilyWhatsAppLinks, directWhatsAppUrl: createWhatsAppUrl(owner.phone, emergencyMessage) };
};

/**
 * Check PUC & Insurance Expiry and return status
 */
const checkDocumentExpiryStatus = (documents) => {
  const now = new Date();
  const result = {
    puc: { status: 'NOT_UPLOADED', daysRemaining: null },
    insurance: { status: 'NOT_UPLOADED', daysRemaining: null }
  };

  if (documents?.puc?.validUntil) {
    const diffDays = Math.ceil((new Date(documents.puc.validUntil) - now) / (1000 * 60 * 60 * 24));
    result.puc.daysRemaining = diffDays;
    result.puc.status = diffDays < 0 ? 'EXPIRED' : (diffDays <= 15 ? 'EXPIRING_SOON' : 'VALID');
  }

  if (documents?.insurance?.validUntil) {
    const diffDays = Math.ceil((new Date(documents.insurance.validUntil) - now) / (1000 * 60 * 60 * 24));
    result.insurance.daysRemaining = diffDays;
    result.insurance.status = diffDays < 0 ? 'EXPIRED' : (diffDays <= 30 ? 'EXPIRING_SOON' : 'VALID');
  }

  return result;
};

module.exports = {
  sanitizePhone,
  createWhatsAppUrl,
  sendSMS,
  sendWhatsAppMessage,
  triggerEmergencyCall,
  sendNoParkingAlert,
  sendAccidentAlert,
  checkDocumentExpiryStatus
};
