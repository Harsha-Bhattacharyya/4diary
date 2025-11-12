/**
 * Derives a base64-encoded encryption key from a password using PBKDF2 with the user's email as salt.
 *
 * @param password - The user's password used as the PBKDF2 input key material
 * @param email - The user's email used as the PBKDF2 salt
 * @returns A base64-encoded 256-bit key derived from the provided password and email
 */
export async function deriveKeyFromPassword(
  password: string,
  email: string
): Promise<string> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = encoder.encode(email);

  const key = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveBits"]
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256
  );

  return Buffer.from(derivedBits).toString("base64");
}
