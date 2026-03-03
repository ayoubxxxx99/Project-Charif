<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Helvetica', sans-serif; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
        .content { margin-top: 30px; line-height: 1.6; }
        .appointment-box { background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .footer { margin-top: 50px; font-size: 12px; color: #666; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Convocation d'Inscription</h1>
        <p>Lycée Charif Idrissi - Administration</p>
    </div>

    <div class="content">
        <p>Cher(e) <strong>{{ $name }}</strong>,</p>
        <p>Nous avons le plaisir de vous informer que votre candidature a été retenue pour l'année scolaire 2026.</p>
        <p>Vous êtes prié(e) de vous présenter au bureau de l'administration pour finaliser votre inscription :</p>

        <div class="appointment-box">
            <h2 style="margin: 0; color: #2563eb;">{{ $date }}</h2>
            <h3 style="margin: 5px 0;">à {{ $time }}</h3>
        </div>

        <p><strong>Documents requis :</strong></p>
        <ul>
            <li>Original du diplôme ou attestation de scolarité.</li>
            <li>Copie de la CNI ou Extrait d'acte de naissance.</li>
            <li>4 Photos d'identité.</li>
        </ul>
    </div>

    <div class="footer">
        <p>Ceci est un document officiel généré automatiquement.</p>
    </div>
</body>
</html>
