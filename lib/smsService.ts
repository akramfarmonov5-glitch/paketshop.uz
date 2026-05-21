let cachedToken: string | null = null;
let cachedTokenExpiry: number | null = null; // Timestamp

async function loginToEskiz(): Promise<string | null> {
  const email = process.env.ESKIZ_EMAIL;
  const password = process.env.ESKIZ_PASSWORD;

  if (!email || !password) {
    console.warn("Eskiz credentials missing in environment variables.");
    return null;
  }

  try {
    const response = await fetch('https://notify.eskiz.uz/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (response.ok && data?.data?.token) {
      cachedToken = data.data.token;
      // Eskiz token is typically valid for 30 days (let's set safe expiry to 25 days)
      cachedTokenExpiry = Date.now() + 25 * 24 * 60 * 60 * 1000;
      return cachedToken;
    } else {
      console.error("Eskiz login failed:", data);
      return null;
    }
  } catch (error) {
    console.error("Error logging in to Eskiz:", error);
    return null;
  }
}

async function getEskizToken(): Promise<string | null> {
  if (cachedToken && cachedTokenExpiry && Date.now() < cachedTokenExpiry) {
    return cachedToken;
  }
  return loginToEskiz();
}

export async function sendSMS(phone: string, message: string): Promise<boolean> {
  // Format phone number to UZ standard format (998XXXXXXXXX)
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.length === 9) {
    cleanPhone = '998' + cleanPhone;
  }

  if (cleanPhone.length !== 12 || !cleanPhone.startsWith('998')) {
    console.error(`Invalid phone number format for SMS: ${phone}`);
    return false;
  }

  let token = await getEskizToken();
  if (!token) return false;

  const sendRequest = async (activeToken: string) => {
    return fetch('https://notify.eskiz.uz/api/message/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeToken}`
      },
      body: JSON.stringify({
        mobile_phone: cleanPhone,
        message: message,
        from: '4546', // Default Eskiz nickname/sender code
        callback_url: null
      })
    });
  };

  try {
    let response = await sendRequest(token);

    // If unauthorized, clear cached token, login again, and retry once
    if (response.status === 401) {
      console.warn("Eskiz token expired or invalid, retrying login...");
      cachedToken = null;
      cachedTokenExpiry = null;
      token = await loginToEskiz();
      if (!token) return false;
      response = await sendRequest(token);
    }

    const data = await response.json();
    if (response.ok) {
      console.log(`SMS successfully sent to ${cleanPhone}: "${message}"`);
      return true;
    } else {
      console.error("Failed to send SMS via Eskiz:", data);
      return false;
    }
  } catch (error) {
    console.error("Error sending SMS:", error);
    return false;
  }
}
