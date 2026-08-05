import ExcelJS from 'exceljs';
import { AssessmentSectionConfig } from '../types/vacancy.types';

/**
 * STEP Enterprise Platform — Dynamic Multi-Worksheet Excel Engine
 *
 * Encapsulates ExcelJS template generation, dynamic multi-worksheet builder,
 * in-cell data validation dropdowns, and file upload parsing.
 */

// Generate Native Binary .xlsx Workbook with In-Cell Data Validation & Download in Browser
export async function downloadAssessmentExcelTemplate(
  sections: AssessmentSectionConfig[],
  grandTotalQuestions: number,
  grandTotalMarks: number
): Promise<void> {
  const wb = new ExcelJS.Workbook();

  // Compute total time dynamically
  const grandTotalTime = sections.reduce((acc, s) => acc + (Number(s.timeLimitMinutes) || 0), 0);

  // 1. Instructions Sheet
  const instrSheet = wb.addWorksheet('Instructions');
  instrSheet.columns = [{ width: 100 }];
  
  const instrRows: (string[])[] = [
    ['STEP ENTERPRISE ASSESSMENT QUESTION BANK TEMPLATE INSTRUCTIONS'],
    [''],
    ['SUMMARY & ASSESSMENT PATTERN SPECIFICATIONS:'],
    [`• Total Configured Sections: ${sections.length}`],
    [`• Total Questions: ${grandTotalQuestions}`],
    [`• Total Assessment Timing: ${grandTotalTime} Minutes`],
    [`• Total Assessment Marks: ${grandTotalMarks} Marks`],
    [''],
    ['DYNAMIC SECTION-WISE BREAKDOWN:'],
  ];

  sections.forEach((sec, idx) => {
    instrRows.push([
      `  • Section ${idx + 1}: ${sec.sectionTitle} | ${sec.totalQuestions} Questions | ${sec.timeLimitMinutes} Mins | ${sec.marksPerQuestion} Marks/Q = ${sec.totalMarks} Total Marks`
    ]);
  });

  instrRows.push(
    [''],
    ['FILLING GUIDELINES:'],
    ['1. Fill question details in the corresponding section worksheets below.'],
    ['2. In MCQ worksheets, select SINGLE_CHOICE or MULTI_CHOICE from the question_type dropdown.'],
    ['3. For MULTI_CHOICE questions, specify comma-separated correct options in correct_option (e.g. A,C).'],
    ['4. Marks are automatically assigned per section based on your Step 3 pattern configuration.'],
    ['5. Save the completed Excel workbook (.xlsx) and upload it in Step 3.']
  );

  instrRows.forEach((r) => instrSheet.addRow(r));
  instrSheet.getRow(1).font = { bold: true, size: 13 };

  // 2. Dynamic Section Worksheets (Generated strictly based on Step 1 Sections)
  sections.forEach((sec, idx) => {
    const typeName = sec.sectionTitle.toUpperCase();
    const isMCQMulti = typeName.includes('MULTI') || typeName.includes('MULTIPLE');
    const isMCQSingle = typeName.includes('MCQ') || typeName.includes('CHOICE') || typeName.includes('SINGLE');
    const isCoding = typeName.includes('CODING') || typeName.includes('ALGORITHM');
    const isSQL = typeName.includes('SQL') || typeName.includes('DATABASE');

    const cleanSheetName = `Sec ${idx + 1}-${sec.sectionTitle.replace(/[^\w\s-]/g, '')}`.substring(0, 31);
    const secSheet = wb.addWorksheet(cleanSheetName);

    if (isCoding) {
      secSheet.columns = [
        { header: 'question_type', key: 'question_type', width: 18 },
        { header: 'question_text', key: 'question_text', width: 60 },
        { header: 'programming_language', key: 'programming_language', width: 25 },
      ];
      for (let i = 1; i <= Math.min(sec.totalQuestions, 2); i++) {
        secSheet.addRow({
          question_type: 'CODING',
          question_text: `Write a function to solve ${sec.sectionTitle} problem #${i}?`,
          programming_language: 'Python',
        });
      }
    } else if (isSQL) {
      secSheet.columns = [
        { header: 'question_type', key: 'question_type', width: 18 },
        { header: 'question_text', key: 'question_text', width: 60 },
        { header: 'db_schema_ddl', key: 'db_schema_ddl', width: 45 },
      ];
      for (let i = 1; i <= Math.min(sec.totalQuestions, 2); i++) {
        secSheet.addRow({
          question_type: 'SQL',
          question_text: `Write SQL query for ${sec.sectionTitle} problem #${i}?`,
          db_schema_ddl: 'CREATE TABLE users (id INT, name VARCHAR(50));',
        });
      }
    } else if (isMCQMulti || isMCQSingle) {
      secSheet.columns = [
        { header: 'question_type', key: 'question_type', width: 20 },
        { header: 'question_text', key: 'question_text', width: 55 },
        { header: 'option_a', key: 'option_a', width: 30 },
        { header: 'option_b', key: 'option_b', width: 30 },
        { header: 'option_c', key: 'option_c', width: 30 },
        { header: 'option_d', key: 'option_d', width: 30 },
        { header: 'correct_option', key: 'correct_option', width: 18 },
      ];

      const defaultType = isMCQMulti ? 'MULTI_CHOICE' : 'SINGLE_CHOICE';
      const defaultCorrect = isMCQMulti ? 'A,C' : 'A';

      for (let i = 1; i <= Math.min(sec.totalQuestions, 2); i++) {
        secSheet.addRow({
          question_type: defaultType,
          question_text: `Sample question for ${sec.sectionTitle} #${i}?`,
          option_a: 'Option A Choice',
          option_b: 'Option B Choice',
          option_c: 'Option C Choice',
          option_d: 'Option D Choice',
          correct_option: defaultCorrect,
        });
      }

      // Attach Real Native Excel In-Cell Data Validation Dropdown Menu to Column A (question_type)
      for (let r = 2; r <= 200; r++) {
        const cell = secSheet.getCell(`A${r}`);
        cell.dataValidation = {
          type: 'list',
          allowBlank: false,
          formulae: ['"SINGLE_CHOICE,MULTI_CHOICE"'],
          showErrorMessage: true,
          errorTitle: 'Invalid Question Type',
          error: 'Please select either SINGLE_CHOICE or MULTI_CHOICE from the dropdown list.',
        };
      }
    } else {
      secSheet.columns = [
        { header: 'question_type', key: 'question_type', width: 18 },
        { header: 'question_text', key: 'question_text', width: 60 },
        { header: 'max_word_count', key: 'max_word_count', width: 18 },
      ];
      for (let i = 1; i <= Math.min(sec.totalQuestions, 2); i++) {
        secSheet.addRow({
          question_type: 'SUBJECTIVE',
          question_text: `Explain the architectural approach for ${sec.sectionTitle} #${i}?`,
          max_word_count: '500',
        });
      }
    }

    // Styled Headers (Soft Indigo fill + bold text)
    const headerRow = secSheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FF3730A3' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E7FF' },
    };
  });

  // Write binary buffer and trigger browser download
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Assessment_Question_Bank_Template.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Parse Uploaded Binary Excel File
export async function parseUploadedAssessmentExcel(file: File): Promise<{ success: boolean; totalParsedQuestions: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(arrayBuffer);

  let totalParsedQuestions = 0;
  wb.worksheets.forEach((ws) => {
    if (ws.name !== 'Instructions') {
      totalParsedQuestions += Math.max(0, ws.rowCount - 1);
    }
  });

  return { success: true, totalParsedQuestions };
}
