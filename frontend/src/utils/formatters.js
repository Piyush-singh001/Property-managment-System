/**
 * Formats numeric price into Indian Rupee currency format (e.g. ₹35,000)
 */
export const formatINR = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

/**
 * Formats ISO date to readable string (e.g. 18 Sep 2026)
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

/**
 * Generates direct WhatsApp URL with pre-filled enquiry message
 */
export const getWhatsAppLink = (whatsappNumber, template, property) => {
  if (!whatsappNumber) return '#';
  // Strip non-numeric except leading plus
  let cleanNumber = whatsappNumber.replace(/[^\d+]/g, '');
  if (cleanNumber.startsWith('+')) {
    cleanNumber = cleanNumber.substring(1);
  }
  
  let text = template || 'Hi, I am interested in property {property_code} - {bhk} in {locality}.';
  if (property) {
    text = text
      .replace('{property_code}', property.property_code || '')
      .replace('{bhk}', property.bhk || '')
      .replace('{furnishing}', property.furnishing || '')
      .replace('{locality}', property.locality || '')
      .replace('{title}', property.title || '');
  }
  
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`;
};

/**
 * Returns call link
 */
export const getCallLink = (phoneNumber) => {
  if (!phoneNumber) return '#';
  const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
  return `tel:${cleanNumber}`;
};

/**
 * Checks if a given media URL is a video
 */
export const isVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
};

/**
 * Resolves media URLs (images, videos) to full absolute backend URL if starting with /static
 */
export const getMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const apiBase = import.meta.env.VITE_API_BASE_URL;
  if (apiBase && (apiBase.startsWith('http://') || apiBase.startsWith('https://'))) {
    try {
      const backendOrigin = new URL(apiBase).origin;
      return `${backendOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
    } catch {
      return url;
    }
  }
  return url;
};


