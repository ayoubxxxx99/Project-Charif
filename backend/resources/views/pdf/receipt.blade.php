<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Reçu de Candidature</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            color: #334155;
            background: #ffffff;
            padding: 48px 56px;
        }

        .header-table {
            width: 100%;
            border-bottom: 3px solid #0f172a;
            padding-bottom: 16px;
            margin-bottom: 8px;
        }

        .header-table td { vertical-align: top; }
        .header-table td:last-child { text-align: right; }

        .school-name {
            font-size: 18px;
            font-weight: bold;
            color: #0f172a;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }

        .school-sub {
            font-size: 11px;
            color: #64748b;
            line-height: 1.7;
        }

        .doc-meta {
            font-size: 10.5px;
            color: #64748b;
            line-height: 1.8;
        }

        .doc-ref {
            font-weight: bold;
            color: #0f172a;
            font-size: 11px;
            letter-spacing: 1px;
        }

        .accent-bar {
            height: 4px;
            background: linear-gradient(90deg, #0d9488, #2dd4bf);
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
            color: #94a3b8;
            margin-bottom: 6px;
        }

        .title-main {
            font-size: 24px;
            font-weight: bold;
            color: #0f172a;
            letter-spacing: 1px;
            text-transform: uppercase;
        }

        .title-underline {
            width: 60px;
            height: 3px;
            background: linear-gradient(90deg, #0d9488, #2dd4bf);
            margin: 10px auto 0;
        }

        .info-card {
            background: #f8fafc;
            border-left: 4px solid #0d9488;
            padding: 16px 20px;
            margin-bottom: 24px;
            border-radius: 0 8px 8px 0;
        }

        .info-card-title {
            font-size: 10px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #0d9488;
            font-weight: bold;
            margin-bottom: 14px;
        }

        .info-table { width: 100%; border-collapse: collapse; }

        .info-table tr td { padding: 6px 0; vertical-align: middle; }

        .info-dot-cell { width: 18px; }

        .info-dot {
            width: 6px;
            height: 6px;
            background: #0d9488;
            border-radius: 50%;
            display: inline-block;
        }

        .info-label-cell {
            width: 150px;
            font-size: 11px;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .info-value-cell {
            font-size: 13px;
            font-weight: bold;
            color: #0f172a;
        }

        .grades-section {
            margin: 24px 0;
        }

        .grades-title {
            font-size: 10px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: #0d9488;
            font-weight: bold;
            margin-bottom: 14px;
        }

        .grades-table {
            width: 100%;
            border-collapse: collapse;
        }

        .grades-table th {
            background: #f1f5f9;
            padding: 10px 12px;
            text-align: left;
            font-size: 10px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 2px solid #e2e8f0;
        }

        .grades-table td {
            padding: 10px 12px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 12px;
            color: #334155;
        }

        .grades-table td:last-child {
            font-weight: bold;
            color: #0f172a;
        }

        .mean-row {
            background: #f0fdfa;
        }

        .mean-row td {
            font-weight: bold;
            color: #0d9488;
            border-top: 2px solid #0d9488;
        }

        .footer {
            position: fixed;
            bottom: 24px;
            left: 56px;
            right: 56px;
            border-top: 1px solid #e2e8f0;
            padding-top: 10px;
        }

        .footer-table { width: 100%; }

        .footer-table td { vertical-align: middle; }

        .footer-table td:last-child { text-align: right; }

        .footer-note {
            font-size: 9.5px;
            color: #94a3b8;
        }

        .footer-stamp {
            font-size: 9.5px;
            font-weight: bold;
            color: #0f172a;
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
                    Tétouan, Maroc
                </div>
            </td>
            <td>
                <div class="doc-meta">
                    <span class="doc-ref">REÇU DE CANDIDATURE</span><br>
                    Réf : LCI/RC/{{ date('Y') }}/{{ $massar_code }}<br>
                    Date : {{ $date_generation }}
                </div>
            </td>
        </tr>
    </table>

    <div class="accent-bar"></div>

    <div class="title-block">
        <div class="title-label">Document de candidature</div>
        <div class="title-main">Reçu de Candidature</div>
        <div class="title-underline"></div>
    </div>

    <div class="info-card">
        <div class="info-card-title">Informations du candidat</div>
        <table class="info-table">
            <tr>
                <td class="info-dot-cell"><span class="info-dot"></span></td>
                <td class="info-label-cell">Nom complet</td>
                <td class="info-value-cell">{{ $name }}</td>
            </tr>
            <tr>
                <td class="info-dot-cell"><span class="info-dot"></span></td>
                <td class="info-label-cell">Code Massar</td>
                <td class="info-value-cell">{{ $massar_code }}</td>
            </tr>
            <tr>
                <td class="info-dot-cell"><span class="info-dot"></span></td>
                <td class="info-label-cell">Email</td>
                <td class="info-value-cell">{{ $email }}</td>
            </tr>
            <tr>
                <td class="info-dot-cell"><span class="info-dot"></span></td>
                <td class="info-label-cell">Date de soumission</td>
                <td class="info-value-cell">{{ $date_submission }}</td>
            </tr>
        </table>
    </div>

    <div class="grades-section">
        <div class="grades-title">Notes soumises</div>
        <table class="grades-table">
            <thead>
                <tr>
                    <th>Matière</th>
                    <th>Note / 20</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Mathématiques</td>
                    <td>{{ $maths }}</td>
                </tr>
                <tr>
                    <td>Physique</td>
                    <td>{{ $physique }}</td>
                </tr>
                <tr>
                    <td>Langue Étrangère</td>
                    <td>{{ $langue_etrangere }}</td>
                </tr>
                <tr>
                    <td>Langue Secondaire</td>
                    <td>{{ $langue_secondaire }}</td>
                </tr>
                <tr>
                    <td>Histoire-Géographie</td>
                    <td>{{ $histoire_geo }}</td>
                </tr>
                <tr>
                    <td>Éducation Islamique</td>
                    <td>{{ $education_islamique }}</td>
                </tr>
                <tr>
                    <td>Sport</td>
                    <td>{{ $sport }}</td>
                </tr>
                <tr class="mean-row">
                    <td>Moyenne Générale</td>
                    <td>{{ $moyenne }} / 20</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="footer">
        <table class="footer-table">
            <tr>
                <td><span class="footer-note">Ce document est généré automatiquement.</span></td>
                <td><span class="footer-stamp">LCI — Document Officiel</span></td>
            </tr>
        </table>
    </div>

</body>
</html>