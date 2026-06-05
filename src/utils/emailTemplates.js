export const generateOTPEmailTemplate = (title, message, otp, validFor) => {
  return `
    <div style="background-color: #FAF8F5; padding: 40px 20px; width: 100%; box-sizing: border-box;">
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #EAE5D9; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(17,77,60,0.1); background-color: #ffffff;">
        <div style="background-color: #114D3C; padding: 40px 30px; text-align: center; border-bottom: 4px solid #16A34A;">
          <img src="cid:logo" alt="Lalbaug Roti House Logo" style="height: 80px; margin-bottom: 10px; border-radius: 12px; border: 2px solid #C19B6C;" />
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">Lalbaug Roti House</h1>
          <p style="color: #C19B6C; margin: 8px 0 0 0; font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 3px;">100% Pure Veg</p>
        </div>
        <div style="padding: 40px 30px; background-color: #ffffff;">
          <h2 style="color: #2C3E35; font-size: 22px; margin-top: 0; margin-bottom: 24px; font-weight: 700;">${title}</h2>
          <p style="color: #73706A; font-size: 16px; line-height: 1.6; margin-bottom: 35px;">
            ${message}
          </p>
          <div style="background-color: #FAF8F5; border: 2px dashed #16A34A; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 35px;">
            <p style="color: #73706A; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold; margin: 0 0 15px 0;">Your Verification Code</p>
            <span style="font-size: 42px; font-weight: 800; color: #114D3C; letter-spacing: 8px; display: inline-block;">${otp}</span>
          </div>
          <p style="color: #73706A; font-size: 15px; line-height: 1.6; margin-bottom: 0;">
            This code is valid for <strong style="color: #E63946;">${validFor}</strong>. For security reasons, please do not share this code with anyone.
          </p>
        </div>
        <div style="background-color: #FAF8F5; padding: 25px; text-align: center; border-top: 1px solid #D5CDBD;">
          <p style="color: #73706A; font-size: 13px; margin: 0;">
            &copy; ${new Date().getFullYear()} Lalbaug Roti House. All rights reserved.<br>
            <span style="display: block; margin-top: 8px; font-size: 11px;">If you didn't request this code, you can safely ignore this email.</span>
          </p>
        </div>
      </div>
    </div>
  `;
};
