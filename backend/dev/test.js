import dotenv from 'dotenv';
dotenv.config();

/* const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
console.log("Raw FIREBASE_SERVICE_ACCOUNT:", rawServiceAccount);

if (rawServiceAccount) {
  try {
    const parsedAccount = JSON.parse(rawServiceAccount);
    console.log("Parsed Account:", parsedAccount);
  } catch (error) {
    console.error("Parsing Error:", error);
    if (rawServiceAccount.length > 135) {
      console.log("Problematic Substring:", rawServiceAccount.substring(130, 150));
    }
  }
} else {
  console.warn("FIREBASE_SERVICE_ACCOUNT is not defined in .env");
} */

/*const firebaseServiceAccountString = `{
  "type": "service_account",
  "project_id": "jmill29-portfolio",
  "private_key_id": "<private_key_id>",
  "private_key": "-----BEGIN PRIVATE KEY-----\\n<private_key_p1>\\n<private_key_p2>\\n<private_key_p3>\\n<private_key_p4>\\n<private_key_p5>\\n<private_key_p6>\\n<private_key_p7>\\n<private_key_p8>\\n<private_key_p9>\\n<private_key_p10>\\n<private_key_p11>\\n<private_key_p12>\\n<private_key_p13>\\n<private_key_p14>\\n<private_key_p15>\\n<private_key_p16>\\n<private_key_p17>\\n<private_key_p18>\\n<private_key_p19>\\n<private_key_p20>\\n<private_key_p21>\\n<private_key_p22>\\n<private_key_p23>\\n<private_key_p24>\\n<private_key_p25>\\n<private_key_p26>\\n-----END PRIVATE KEY-----\\n",
  "client_email": "<client_email>",
  "client_id": "<client_id>",
  "auth_uri": "<auth_uri>",
  "token_uri": "<token_uri>",
  "auth_provider_x509_cert_url": "<auth_provider_x509_cert_url>",
  "client_x509_cert_url": "<client_x509_cert_url>",
  "universe_domain": "googleapis.com"
}`;

console.log("Direct String:", firebaseServiceAccountString);
console.log("Parsed Direct:", JSON.parse(firebaseServiceAccountString));*/

console.log(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));