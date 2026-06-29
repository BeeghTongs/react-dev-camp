
const API_BASE = '/v1';
const CLIENT_API_BASE = '/client/v1';

const getErrorMessage = async (response, fallback) => {
  const text = await response.text().catch(() => '');

  if (!text) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === 'string') {
      return parsed;
    }
    return parsed.message || parsed.error || parsed.detail || fallback;
  } catch {
    return text;
  }
};

/**
 * Create a new user account
 */
export const createUser = async (username, password) => {

  const response = await fetch(`${API_BASE}/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });


  const text = await response.text();

  let payload = {};
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = {};
    }
  }

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error('This username/email already exists. Please log in instead.');
    }

    throw new Error(payload.message || text || 'Failed to create user account');
  }

  return payload;
};

/**
 * Get authentication token using Basic auth
 */
export const getAuthToken = async (username, password) => {
  const credentials = btoa(`${username}:${password}`);

  const response = await fetch(`${API_BASE}/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to get authentication token');
  }

  const data = await response.json();
  return data.loginAccessKey || data.token || data.accessToken || data.jwt || data;
};

/**
 * Create client profile with the provided token
 */
export const createClientProfile = async (token, profileData) => {

  const authToken = typeof token === 'string'
    ? token
    : token?.loginAccessKey || token?.token || token?.accessToken || token?.jwt || '';

  if (!authToken) {
    throw new Error('Authentication token is missing');
  }

  const response = await fetch(`${CLIENT_API_BASE}/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      email: profileData.email,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      idNumber: profileData.idNumber,
      customerTypeId: profileData.customerTypeId || 0,
    }),
  });

  const text = await response.text();
  let payload = {};
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = {};
    }
  }

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error('A customer profile already exists for this user. Please log in instead.');
    }

    throw new Error(payload.message || text || 'Failed to create client profile');
  }

  return payload;
};

export const getCustomerTypes = async (token) => {
  const response = await fetch(`${API_BASE}/customerTypes`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await getErrorMessage(response, 'Failed to load customer types');
    throw new Error(error);
  }

  return response.json();
};

export const getClientProfile = async (token) => {
  const response = await fetch(`${CLIENT_API_BASE}/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await getErrorMessage(response, 'Failed to fetch profile');
    throw new Error(error);
  }

  return response.json();
};

export const updateClientProfile = async (token, profileData) => {
  const response = await fetch(`${CLIENT_API_BASE}/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      email: profileData.email,
      firstName: profileData.firstName,
      lastName: profileData.lastName,
      idNumber: profileData.idNumber,
      customerTypeId: profileData.customerTypeId,
    }),
  });

  if (!response.ok) {
    const error = await getErrorMessage(response, 'Failed to update profile');
    throw new Error(error);
  }

  return response.json();
};

export const completeSignup = async (signupData) => {
  const { email, password, firstName, lastName, idNumber, customerTypeId } = signupData;

  try {
    // Step 1: Create user
   await createUser(email, password);

    // Step 2: Get authentication token
    const token = await getAuthToken(email, password);

    // Step 3: Create client profile
    const profile = await createClientProfile(token, {
      email,
      firstName,
      lastName,
      idNumber,
      customerTypeId: customerTypeId ?? 0,
    });
    
    return {
      success: true,
      token,
      profile,
    };
  } catch (error) {
    console.error('Signup failed');
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    throw error;
  }
};
