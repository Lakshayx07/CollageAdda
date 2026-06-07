export const extractInstagramUsername = (url) => {
  if (!url) return null;
  // Remove trailing slash
  url = url.replace(/\/$/, '');
  // Extract username from URL
  if (url.includes('instagram.com/')) {
    return '@' + url.split('instagram.com/')[1].split('/')[0];
  }
  // If already a username (not URL)
  if (!url.includes('http')) {
    return url.startsWith('@') ? url : '@' + url;
  }
  return url;
};

export const extractGenericUsername = (url, domain) => {
  if (!url) return null;
  url = url.replace(/\/$/, '');
  if (url.includes(`${domain}/`)) {
    return url.split(`${domain}/`)[1].split('/')[0];
  }
  if (!url.includes('http')) {
    return url.startsWith('@') ? url.substring(1) : url;
  }
  return url;
};
