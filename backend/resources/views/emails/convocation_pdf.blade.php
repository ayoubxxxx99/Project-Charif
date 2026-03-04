<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Convocation Officielle</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            color: #1a1a2e;
            background: #ffffff;
            padding: 48px 56px;
        }

        .header-table {
            width: 100%;
            border-bottom: 3px solid #1a3a6e;
            padding-bottom: 16px;
            margin-bottom: 8px;
        }

        .header-table td { vertical-align: top; }
        .header-table td:last-child { text-align: right; }

        .school-name {
            font-size: 17px;
            font-weight: bold;
            color: #1a3a6e;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }

        .school-sub {
            font-size: 11px;
            color: #555;
            line-height: 1.7;
        }

        .doc-meta {
            font-size: 10.5px;
            color: #555;
            line-height: 1.8;
        }

        .doc-ref {
            font-weight: bold;
            color: #1a3a6e;
            font-size: 11px;
        }

        .accent-bar {
            height: 4px;
            background: #1a3a6e;
            border-radius: 2px;
            margin: 14px 0 28px;
        }

        .title-block {
            text-align: center;
            margin-bottom: 28px;
        }

        .title-label {
            font-size: 10px;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: #888;
            margin-bottom: 6px;
        }

        .title-main {
            font-size: 22px;
            font-weight: bold;
            color: #1a3a6e;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .title-underline {
            width: 60px;
            height: 3px;
            background: #2a6fc7;
            margin: 10px auto 0;
        }

        .greeting {
            font-size: 12.5px;
            color: #333;
            margin-bottom: 16px;
            line-height: 1.8;
        }

        .greeting strong { color: #1a3a6e; }

        .body-text {
            font-size: 12px;
            color: #444;
            line-height: 2;
            margin-bottom: 24px;
        }

        .info-card {
            background: #f4f7fb;
            border-left: 4px solid #2a6fc7;
            padding: 16px 20px;
            margin-bottom: 24px;
        }

        .info-card-title {
            font-size: 10px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #2a6fc7;
            font-weight: bold;
            margin-bottom: 14px;
        }

        .info-table { width: 100%; border-collapse: collapse; }

        .info-table tr td { padding: 5px 0; vertical-align: middle; }

        .info-dot-cell { width: 18px; }

        .info-dot {
            width: 6px;
            height: 6px;
            background: #2a6fc7;
            border-radius: 50%;
            display: inline-block;
        }

        .info-label-cell {
            width: 150px;
            font-size: 11px;
            color: #888;
        }

        .info-value-cell {
            font-size: 13px;
            font-weight: bold;
            color: #1a3a6e;
        }

        .instructions {
            background: #fff8e6;
            border: 1px solid #f5c842;
            padding: 14px 18px;
            margin-bottom: 32px;
        }

        .instructions-title {
            font-size: 10.5px;
            font-weight: bold;
            color: #b07d00;
            letter-spacing: 1px;
            text-transform: uppercase;
            margin-bottom: 10px;
        }

        .instructions li {
            font-size: 11px;
            color: #555;
            line-height: 2;
            margin-left: 16px;
        }

        .signature-block {
            text-align: right;
            margin-top: 20px;
        }

        .sig-intro {
            font-size: 11px;
            color: #888;
            margin-bottom: 40px;
        }

        .sig-line {
            width: 180px;
            height: 1px;
            background: #ccc;
            margin: 0 0 8px auto;
        }

        .sig-name {
            font-size: 13px;
            font-weight: bold;
            color: #1a3a6e;
        }

        .sig-title {
            font-size: 10.5px;
            color: #777;
        }

        .footer {
            position: fixed;
            bottom: 24px;
            left: 56px;
            right: 56px;
            border-top: 1px solid #dde3ee;
            padding-top: 10px;
        }

        .footer-table { width: 100%; }
        .footer-table td { vertical-align: middle; }
        .footer-table td:last-child { text-align: right; }

        .footer-note { font-size: 9.5px; color: #aaa; }

        .footer-stamp {
            font-size: 9.5px;
            font-weight: bold;
            color: #1a3a6e;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
    </style>
</head>
<body>

    <table class="header-table">
        <tr>
            <td>
                <div class="school-name">Lycée Charif Idrissi</div>
                <div class="school-sub">
                    Service des Admissions<br>
                    Tétouan, Maroc<br>
                    admissions@lci.ma
                </div>
            </td>
            <td>
                <div class="doc-meta">
                    <span class="doc-ref">CONVOCATION OFFICIELLE</span><br>
                    Réf : LCI/ADM/{{ date('Y') }}<br>
                    Date : {{ date('d/m/Y') }}
                </div>
            </td>
        </tr>
    </table>

    <div class="accent-bar"></div>

    <div class="title-block">
        <div class="title-label">Document officiel</div>
        <div class="title-main">Convocation</div>
        <div class="title-underline"></div>
    </div>

    <div class="greeting">
        Madame / Monsieur <strong>{{ $name }}</strong>,
    </div>

    <div class="body-text">
        Nous avons l'honneur de vous informer que votre candidature au Lycée Charif Idrissi
        a été examinée avec attention par notre commission d'admission.<br><br>
        Après étude de votre dossier, nous avons le plaisir de vous convoquer pour un
        entretien d'admission selon les modalités suivantes :
    </div>

    <div class="info-card">
        <div class="info-card-title">Détails du rendez-vous</div>
        <table class="info-table">
            <tr>
                <td class="info-dot-cell"><span class="info-dot"></span></td>
                <td class="info-label-cell">Candidat</td>
                <td class="info-value-cell">{{ $name }}</td>
            </tr>
            <tr>
                <td class="info-dot-cell"><span class="info-dot"></span></td>
                <td class="info-label-cell">Date</td>
                <td class="info-value-cell">
                    {{ \Carbon\Carbon::parse($date)->locale('fr')->isoFormat('dddd D MMMM YYYY') }}
                </td>
            </tr>
            <tr>
                <td class="info-dot-cell"><span class="info-dot"></span></td>
                <td class="info-label-cell">Heure</td>
                <td class="info-value-cell">{{ $time }}</td>
            </tr>
            <tr>
                <td class="info-dot-cell"><span class="info-dot"></span></td>
                <td class="info-label-cell">Lieu</td>
                <td class="info-value-cell">Lycée Charif Idrissi — Salle d'admission</td>
            </tr>
        </table>
    </div>

    <div class="instructions">
        <div class="instructions-title">Documents à apporter obligatoirement</div>
        <ul>
            <li>Carte d'identité nationale ou livret de famille</li>
            <li>Bulletins scolaires des deux dernières années</li>
            <li>Ce document de convocation (imprimé ou numérique)</li>
            <li>Photos d'identité récentes (2 exemplaires)</li>
        </ul>
    </div>

    <div class="signature-block">
        <div class="sig-intro">Pour la Direction des Admissions,</div>
        <div class="sig-line"></div>
        <div class="sig-name">Le Directeur des Admissions</div>
        <div class="sig-title">Lycée Charif Idrissi — Tétouan</div>
    </div>

    <div class="footer">
        <table class="footer-table">
            <tr>
                <td><span class="footer-note">Ce document est généré automatiquement et fait foi sans signature manuscrite.</span></td>
                <td><span class="footer-stamp">LCI — Document Officiel</span></td>
            </tr>
        </table>
    </div>

</body>
</html>
