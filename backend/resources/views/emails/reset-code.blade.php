<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background: #f4f4f5; padding: 40px;">
    <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px; text-align: center;">
        <h2 style="color: #0d9488;">Lycée Charif Idrissi</h2>
        <p style="color: #475569; font-size: 14px;">Voici votre code de réinitialisation de mot de passe :</p>
        <div style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #0f172a; margin: 24px 0;">
            {{ $code }}
        </div>
        <p style="color: #94a3b8; font-size: 12px;">Ce code expire dans 10 minutes.</p>
    </div>
</body>
</html>