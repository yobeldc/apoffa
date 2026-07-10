// src/lib/demo-data.ts
// Demo data generation for development and testing

import { prisma } from './db';

const DEMO_CASES = [
  {
    title: 'Smith v. Jones (2023)',
    date: new Date('2023-06-15'),
    court: 'High Court',
    judges: 'Justice Smith',
    parties: 'Smith v. Jones',
    summary: 'A landmark case establishing new precedents for contract law.',
    content: `This case concerns the interpretation of contractual obligations between parties.\n\nThe plaintiff, Smith, alleged that Jones breached their agreement by failing to deliver goods as specified.\n\nThe court found in favor of Smith, establishing that clear written terms take precedence over oral agreements.`,
    year: 2023,
    caseType: 'contract',
    sourceName: 'demo',
  },
  {
    title: 'Regina v. Doe (2022)',
    date: new Date('2022-11-30'),
    court: 'Supreme Court',
    judges: 'Chief Justice Williams',
    parties: 'Regina v. Doe',
    summary: 'Criminal case addressing constitutional rights during investigation.',
    content: `This criminal appeal raises important questions about the scope of constitutional protections.\n\nThe accused, Doe, challenged the admissibility of evidence obtained during a search.\n\nThe Supreme Court ruled that the evidence was inadmissible, reinforcing protections against unreasonable searches.`,
    year: 2022,
    caseType: 'criminal',
    sourceName: 'demo',
  },
  {
    title: 'ABC Corp v. XYZ Ltd (2024)',
    date: new Date('2024-01-20'),
    court: 'Federal Court',
    judges: 'Justice Brown, Justice Davis',
    parties: 'ABC Corp v. XYZ Ltd',
    summary: 'Corporate dispute over intellectual property rights.',
    content: `This matter involves a dispute between two technology companies regarding patent infringement.\n\nABC Corp alleged that XYZ Ltd infringed on their proprietary software patent.\n\nThe court found that while XYZ Ltd had used similar methods, the patent itself was overly broad and therefore partially invalid.`,
    year: 2024,
    caseType: 'intellectual-property',
    sourceName: 'demo',
  },
];

export async function seedDemoData() {
  console.log('Seeding demo data...');
  
  for (const caseData of DEMO_CASES) {
    const existing = await prisma.case.findFirst({
      where: { title: caseData.title },
    });
    
    if (!existing) {
      await prisma.case.create({
        data: {
          ...caseData,
          paragraphs: {
            create: caseData.content
              .split('\n\n')
              .map((p, i) => ({
                number: i + 1,
                text: p.trim(),
              })),
          },
        },
      });
      console.log(`Created: ${caseData.title}`);
    } else {
      console.log(`Skipped (exists): ${caseData.title}`);
    }
  }
  
  console.log('Demo data seeding complete.');
}

export async function clearDemoData() {
  console.log('Clearing demo data...');
  
  await prisma.case.deleteMany({
    where: { sourceName: 'demo' },
  });
  
  console.log('Demo data cleared.');
}
