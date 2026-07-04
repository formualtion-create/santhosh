const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel,
  LevelFormat, BorderStyle, Header, Footer, PageNumber, TabStopType, TabStopPosition,
} = require("docx");

const ACCENT = "4F46E5";
const INK = "28244F";
const MUTED = "6B6880";

const rule = (color = "D9D7E8", size = 6) => ({
  paragraph: { border: { bottom: { style: BorderStyle.SINGLE, size, color, space: 4 } } },
});

const body = (text) =>
  new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 160, line: 276 },
    children: [new TextRun({ text, size: 22 })],
  });

const heading = (text) =>
  new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 120 },
    children: [new TextRun({ text, bold: true, size: 24, color: INK })],
  });

const bullet = (text) =>
  new Paragraph({
    numbering: { reference: "bul", level: 0 },
    spacing: { after: 90, line: 270 },
    children: [new TextRun({ text, size: 22 })],
  });

const sigLine = (label) =>
  new Paragraph({
    spacing: { before: 360, after: 40 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: "9E9BB5", space: 6 } },
    children: [new TextRun({ text: " ", size: 22 })],
  });

const sigLabel = (label) =>
  new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: label, size: 18, color: MUTED })] });

const doc = new Document({
  styles: { default: { document: { run: { font: "Arial", size: 22, color: "20223A" } } } },
  numbering: {
    config: [
      { reference: "bul", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 260 } } } }] },
    ],
  },
  sections: [
    {
      properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      headers: {
        default: new Header({
          children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "PawsPair Technologies Pvt. Ltd.", size: 16, color: MUTED, bold: true })] })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
            children: [
              new TextRun({ text: "User Declaration & Acceptance · Confidential", size: 15, color: MUTED }),
              new TextRun({ text: "\tPage ", size: 15, color: MUTED }),
              new TextRun({ children: [PageNumber.CURRENT], size: 15, color: MUTED }),
            ],
          })],
        }),
      },
      children: [
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "PAWSPAIR", bold: true, size: 28, color: ACCENT, characterSpacing: 60 })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: "User Declaration & Acceptance", bold: true, size: 40, color: INK })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 }, children: [new TextRun({ text: "PawsPair Technologies Pvt. Ltd. · India", size: 20, color: MUTED, italics: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, ...rule(), children: [new TextRun({ text: "To be accepted by every member at registration", size: 18, color: MUTED })] }),

        body("By creating an account and ticking the acceptance box at registration, I (the “Member”) make the following declaration to PawsPair Technologies Pvt. Ltd. (“PawsPair”). This declaration is an electronic record under the Information Technology Act, 2000 and does not require a physical signature."),

        heading("1. Truthfulness of Information"),
        body("I solemnly declare that all information I have provided — including my name, contact details, location, identity-verification reference, and the details of my pet (name, species, breed, age, health and vaccination status) — is true, accurate, complete and current to the best of my knowledge and belief."),

        heading("2. Identity & Authority"),
        bullet("I am at least 18 years of age and legally competent to enter into this agreement under the Indian Contract Act, 1872."),
        bullet("I am the lawful owner or authorised guardian of the pet I have listed, and I am entitled to share its information."),
        bullet("The identity document I have referenced belongs to me and has been provided lawfully."),

        heading("3. Lawful & Responsible Use"),
        bullet("I will use PawsPair only for lawful purposes and in good faith."),
        bullet("I will treat all animals and members with kindness and respect, and will not engage in fraud, harassment, impersonation, cruelty or any unlawful activity."),
        bullet("Any family-planning (litter) arrangement I pursue will comply with the Prevention of Cruelty to Animals Act, 1960 and Animal Welfare Board of India (AWBI) guidelines."),
        bullet("I take full responsibility for my own conduct and safety during any meeting arranged through the platform."),

        heading("4. Acceptance of Bylaws & Policies"),
        body("I confirm that I have read, understood and agree to be bound by PawsPair’s bylaws and policies, namely the Terms & Conditions, the Privacy Policy (DPDP Act, 2023), the Cancellation & Refund Policy, the Grievance Redressal mechanism, and the Community & Safety guidelines, each as amended from time to time."),

        heading("5. Consent to Data Processing"),
        body("I consent to PawsPair collecting, processing and storing my personal data for the purposes described in the Privacy Policy, in accordance with the Digital Personal Data Protection (DPDP) Act, 2023. I understand I may withdraw consent, and access, correct or erase my data, at any time."),

        heading("6. Acknowledgement of Consequences"),
        body("I understand and accept that if any information I have provided is found to be false, misleading or incomplete, PawsPair may suspend or permanently terminate my account, withhold or revoke verification, and, where required, report the matter to the appropriate authorities. I agree to indemnify PawsPair against any loss arising from a breach of this declaration."),

        heading("7. Governing Law"),
        body("This declaration is governed by the laws of India and is subject to the exclusive jurisdiction of the courts at Bengaluru, Karnataka, without prejudice to any applicable consumer-protection rights."),

        new Paragraph({ spacing: { before: 200, after: 80 }, ...rule("D9D7E8", 6), children: [new TextRun({ text: " ", size: 2 })] }),
        new Paragraph({ spacing: { before: 120, after: 80 }, children: [new TextRun({ text: "Declared and accepted by the Member", bold: true, size: 22, color: INK })] }),
        body("I confirm that I have read and understood this Declaration in full, and I accept it freely and without coercion. By ticking the acceptance box at registration, I adopt this as my electronic signature."),

        sigLine(), sigLabel("Member’s full name"),
        sigLine(), sigLabel("Date"),
        sigLine(), sigLabel("Place"),

        new Paragraph({ spacing: { before: 200 }, children: [new TextRun({ text: "Electronic acceptance, including the date, time and account identifier, is recorded automatically in PawsPair’s systems at the moment of registration.", italics: true, size: 18, color: MUTED })] }),
      ],
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  const out = path.join(__dirname, "..", "docs", "PawsPair - User Declaration & Acceptance.docx");
  fs.writeFileSync(out, buf);
  console.log("wrote", out, "(" + buf.length + " bytes)");
});
