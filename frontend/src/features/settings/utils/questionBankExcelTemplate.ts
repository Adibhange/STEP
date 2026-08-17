import ExcelJS from 'exceljs';

export interface GenerateTemplateOptions {
  languages: string[];
  experienceTiers?: string[];
}

const DEFAULT_EXPERIENCE_TIERS = [
  'Fresher',
  'Junior',
  'Mid-Level',
  'Senior',
  'Lead',
];

/**
 * Generates and downloads a multi-sheet Microsoft Excel (.xlsx) workbook
 * with native Excel Data Validation dropdowns for Question Bank bulk importing.
 * Experience Tier is fetched from Master DB to replace legacy difficulty tags.
 */
export async function downloadQuestionBankExcelTemplate(options: GenerateTemplateOptions): Promise<void> {
  const { languages, experienceTiers = DEFAULT_EXPERIENCE_TIERS } = options;
  const tiers = experienceTiers.length > 0 ? experienceTiers : DEFAULT_EXPERIENCE_TIERS;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'STEP ATS Enterprise';
  workbook.created = new Date();

  // ── Sheet 1: MCQ_Questions ──
  const mcqSheet = workbook.addWorksheet('MCQ_Questions');
  mcqSheet.columns = [
    { header: 'Language', key: 'language', width: 24 },
    { header: 'SectionType', key: 'sectionType', width: 18 },
    { header: 'QuestionType', key: 'questionType', width: 18 },
    { header: 'ExperienceTier', key: 'experienceTier', width: 18 },
    { header: 'QuestionStatement', key: 'questionText', width: 50 },
    { header: 'OptionA', key: 'optionA', width: 30 },
    { header: 'OptionB', key: 'optionB', width: 30 },
    { header: 'OptionC', key: 'optionC', width: 30 },
    { header: 'OptionD', key: 'optionD', width: 30 },
    { header: 'CorrectOption', key: 'correctOption', width: 16 },
    { header: 'Marks', key: 'marks', width: 10 },
  ];
  mcqSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  mcqSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4F46E5' }, // Indigo
  };

  mcqSheet.addRow({
    language: 'C# (.NET)',
    sectionType: 'TechnicalMCQ',
    questionType: 'SINGLE_CHOICE',
    experienceTier: 'Junior',
    questionText: 'What is the primary difference between a class and a struct in C#?',
    optionA: 'Class is reference type (heap); struct is value type (stack).',
    optionB: 'Both are reference types on heap.',
    optionC: 'Both are value types on stack.',
    optionD: 'None of the above.',
    correctOption: 'A',
    marks: 1.0,
  });

  mcqSheet.addRow({
    language: 'C# (.NET)',
    sectionType: 'TechnicalMCQ',
    questionType: 'MULTI_CHOICE',
    experienceTier: 'Senior',
    questionText: 'Which of the following are true about Garbage Collection in .NET? (Select all)',
    optionA: 'Gen 0 collects short-lived objects most frequently.',
    optionB: 'Surviving Gen 1 objects are promoted to Gen 2.',
    optionC: 'LOH is compacted during every Gen 0 collection.',
    optionD: 'GC does not close unmanaged file handles.',
    correctOption: 'A,B,D',
    marks: 2.0,
  });

  mcqSheet.addRow({
    language: 'General Aptitude',
    sectionType: 'Aptitude',
    questionType: 'SINGLE_CHOICE',
    experienceTier: 'Fresher',
    questionText: 'If a car travels 120 km in 2 hours, what is its average speed in m/s?',
    optionA: '16.67 m/s',
    optionB: '20.00 m/s',
    optionC: '60.00 m/s',
    optionD: '25.50 m/s',
    correctOption: 'A',
    marks: 1.0,
  });

  // ── Sheet 2: SQL_Challenges ──
  const sqlSheet = workbook.addWorksheet('SQL_Challenges');
  sqlSheet.columns = [
    { header: 'Language', key: 'language', width: 22 },
    { header: 'ExperienceTier', key: 'experienceTier', width: 18 },
    { header: 'ProblemStatement', key: 'questionText', width: 50 },
    { header: 'TableSchemaDDL', key: 'sqlSchema', width: 45 },
    { header: 'ExpectedQuery', key: 'expectedQuery', width: 45 },
    { header: 'Marks', key: 'marks', width: 10 },
  ];
  sqlSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  sqlSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF0EA5E9' }, // Cyan
  };

  sqlSheet.addRow({
    language: 'SQL (Database)',
    experienceTier: 'Mid-Level',
    questionText: 'Write a query to find the 2nd highest salary from Employee table.',
    sqlSchema: 'CREATE TABLE Employee (Id INT PRIMARY KEY, Name NVARCHAR(50), Salary DECIMAL(18,2));',
    expectedQuery: 'SELECT MAX(Salary) FROM Employee WHERE Salary < (SELECT MAX(Salary) FROM Employee);',
    marks: 5.0,
  });

  // ── Sheet 3: Coding_Challenges ──
  const codeSheet = workbook.addWorksheet('Coding_Challenges');
  codeSheet.columns = [
    { header: 'Language', key: 'language', width: 24 },
    { header: 'ExperienceTier', key: 'experienceTier', width: 18 },
    { header: 'ProblemStatement', key: 'questionText', width: 50 },
    { header: 'StarterCodeStub', key: 'starterCode', width: 40 },
    { header: 'TestCases', key: 'testCases', width: 40 },
    { header: 'Marks', key: 'marks', width: 10 },
  ];
  codeSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  codeSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF10B981' }, // Green
  };

  codeSheet.addRow({
    language: 'JavaScript / React',
    experienceTier: 'Senior',
    questionText: 'Implement function isPalindrome(str) that returns true if a string is palindrome ignoring non-alphanumeric chars.',
    starterCode: 'function isPalindrome(str) {\n  // write code\n}',
    testCases: 'Input: "racecar" -> Output: true | Input: "hello" -> Output: false',
    marks: 10.0,
  });

  // ── Sheet 4: Subjective_Theory ──
  const subjectiveSheet = workbook.addWorksheet('Subjective_Theory');
  subjectiveSheet.columns = [
    { header: 'Language', key: 'language', width: 24 },
    { header: 'ExperienceTier', key: 'experienceTier', width: 18 },
    { header: 'ProblemStatement', key: 'questionText', width: 55 },
    { header: 'EvaluationRubric', key: 'evaluationRubric', width: 45 },
    { header: 'Marks', key: 'marks', width: 10 },
  ];
  subjectiveSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  subjectiveSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF8B5CF6' }, // Purple
  };

  subjectiveSheet.addRow({
    language: 'C# (.NET)',
    experienceTier: 'Senior',
    questionText: 'Explain the difference between async/await and Task.Run in ASP.NET Core web applications, focusing on thread pool starvation.',
    evaluationRubric: 'Candidate must mention I/O vs CPU bound work, synchronization contexts, and thread pool starvation under high concurrency.',
    marks: 5.0,
  });

  // ── Sheet 5: Reference_Data_Validation ──
  const refSheet = workbook.addWorksheet('Validation_Reference');
  refSheet.columns = [
    { header: 'Master Languages', key: 'languages', width: 25 },
    { header: 'Question Types', key: 'questionTypes', width: 20 },
    { header: 'Experience Tiers', key: 'experienceTiers', width: 20 },
    { header: 'Section Types', key: 'sectionTypes', width: 20 },
  ];
  refSheet.getRow(1).font = { bold: true };

  languages.forEach((lang, idx) => {
    refSheet.getRow(idx + 2).getCell(1).value = lang;
  });
  ['SINGLE_CHOICE', 'MULTI_CHOICE', 'SQL', 'CODING', 'SUBJECTIVE'].forEach((t, idx) => {
    refSheet.getRow(idx + 2).getCell(2).value = t;
  });
  tiers.forEach((tier, idx) => {
    refSheet.getRow(idx + 2).getCell(3).value = tier;
  });
  ['Aptitude', 'TechnicalMCQ', 'SQLQuery', 'Coding', 'SubjectiveTheory'].forEach((s, idx) => {
    refSheet.getRow(idx + 2).getCell(4).value = s;
  });

  // Data Validations
  const langCount = languages.length;
  const tierCount = tiers.length;
  for (let i = 2; i <= 200; i++) {
    mcqSheet.getCell(`A${i}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [`'Validation_Reference'!$A$2:$A$${langCount + 1}`],
    };
    mcqSheet.getCell(`B${i}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [`'Validation_Reference'!$D$2:$D$6`],
    };
    mcqSheet.getCell(`C${i}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [`'Validation_Reference'!$B$2:$B$3`],
    };
    mcqSheet.getCell(`D${i}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [`'Validation_Reference'!$C$2:$C$${tierCount + 1}`],
    };

    sqlSheet.getCell(`A${i}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [`'Validation_Reference'!$A$2:$A$${langCount + 1}`],
    };
    sqlSheet.getCell(`B${i}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [`'Validation_Reference'!$C$2:$C$${tierCount + 1}`],
    };

    codeSheet.getCell(`A${i}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [`'Validation_Reference'!$A$2:$A$${langCount + 1}`],
    };
    codeSheet.getCell(`B${i}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [`'Validation_Reference'!$C$2:$C$${tierCount + 1}`],
    };

    subjectiveSheet.getCell(`A${i}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [`'Validation_Reference'!$A$2:$A$${langCount + 1}`],
    };
    subjectiveSheet.getCell(`B${i}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: [`'Validation_Reference'!$C$2:$C$${tierCount + 1}`],
    };
  }

  // Generate buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'STEP_Question_Bank_Template.xlsx');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
