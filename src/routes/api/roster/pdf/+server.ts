// src/routes/api/roster/pdf/+server.ts
import type { RequestHandler } from './$types';
import PDFDocument from 'pdfkit';
import { getDB } from '$lib/db/client';
import { users } from '$lib/db/schema';
import { sql, inArray } from 'drizzle-orm';

// Human labels for DB keys
const FIELD_LABELS: Record<string, string> = {
	address: 'Address',
	phone: 'Phone',
	personalEmail: 'Personal Email',
	workEmail: 'Work Email',
	tshirtSize: 'T-shirt Size',
	maskSize: 'Mask Size',
	fitTestDate: 'Fit Test Date'
};

// Build "Last, First"
function getFieldValue(user: any, key: string): string {
	if (key === 'name') {
		const ln = user.lastName ?? '';
		const fn = user.firstName ?? '';
		if (!ln && !fn) return '';
		return `${ln}, ${fn}`.trim();
	}
	return user[key] ?? '';
}

/* ----------------------------------------------------------
   TWO-PER-ROW MODE (≤ 3 selected fields)
   With: NO WRAP, NO OVERLAP, TRUNCATION, SMALL FONT (8)
----------------------------------------------------------- */
function renderTwoPerRow(doc: PDFKit.PDFDocument, rows: any[], otherFields: string[]) {
	const marginLeft = doc.page.margins.left;
	const marginRight = doc.page.margins.right;
	const marginTop = doc.y;
	const contentWidth = doc.page.width - marginLeft - marginRight;

	const gutter = 25; // spacing between left + right halves
	const blockWidth = (contentWidth - gutter) / 2;

	const keys = ['name', ...otherFields];

	// Column widths tightened for compact layout
	const COLUMN_WIDTHS: Record<string, number> = {
		name: 80,
		phone: 60,
		personalEmail: 100,
		workEmail: 135,
		address: 165,
		maskSize: 50,
		tshirtSize: 50,
		fitTestDate: 75
	};

	const rowHeight = 14;
	doc.fontSize(8);

	let y = marginTop;

	// Utility: trim text so it FITS the cell exactly
	function fitText(text: string, maxWidth: number) {
		if (!text) return '';
		let output = text;
		while (doc.widthOfString(output) > maxWidth) {
			output = output.slice(0, -1);
			if (output.length < 3) break;
		}
		if (output !== text) output += '…';
		return output;
	}

	const drawText = (value: string, x: number, y: number, width: number) => {
		doc.text(value, x + 3, y + 5, {
			lineBreak: false,
			width: width - 6
		});
	};

	const drawCellBox = (x: number, y: number, w: number, h: number) => {
		doc.rect(x, y, w, h).lineWidth(0.5).strokeColor('#cccccc').stroke().strokeColor('black');
	};

	// HEADER
	function drawHeader() {
		doc.font('Helvetica-Bold').fontSize(8);

		let x = marginLeft;

		// Left block header
		for (const key of keys) {
			const w = COLUMN_WIDTHS[key] ?? 100;
			drawCellBox(x, y, w, rowHeight);
			drawText(FIELD_LABELS[key] ?? key, x, y, w);
			x += w;
		}

		// Right block header
		x = marginLeft + blockWidth + gutter;

		for (const key of keys) {
			const w = COLUMN_WIDTHS[key] ?? 100;
			drawCellBox(x, y, w, rowHeight);
			drawText(FIELD_LABELS[key] ?? key, x, y, w);
			x += w;
		}

		y += rowHeight;
		doc.font('Helvetica').fontSize(8);
	}

	const maybeNewPage = () => {
		if (y + rowHeight > doc.page.height - doc.page.margins.bottom - 40) {
			doc.addPage();
			y = doc.page.margins.top;
			drawHeader();
		}
	};

	drawHeader();

	// DATA ROWS
	for (let i = 0; i < rows.length; i += 2) {
		maybeNewPage();

		const leftUser = rows[i];
		const rightUser = rows[i + 1];

		// LEFT USER
		let x = marginLeft;

		for (const key of keys) {
			const w = COLUMN_WIDTHS[key] ?? 100;
			const raw = getFieldValue(leftUser, key);
			const trimmed = fitText(raw, w - 6);

			drawCellBox(x, y, w, rowHeight);
			drawText(trimmed, x, y, w);

			x += w;
		}

		// RIGHT USER
		if (rightUser) {
			x = marginLeft + blockWidth + gutter;

			for (const key of keys) {
				const w = COLUMN_WIDTHS[key] ?? 100;
				const raw = getFieldValue(rightUser, key);
				const trimmed = fitText(raw, w - 6);

				drawCellBox(x, y, w, rowHeight);
				drawText(trimmed, x, y, w);

				x += w;
			}
		}

		y += rowHeight;
	}
}

/* ----------------------------------------------------------
   FULL-WIDTH MODE (≥ 4 selected fields)
----------------------------------------------------------- */
function renderFullWidth(doc: PDFKit.PDFDocument, rows: any[], otherFields: string[]) {
	const marginLeft = doc.page.margins.left;
	const marginRight = doc.page.margins.right;
	const marginTop = doc.y;

	const keys = ['name', ...otherFields];

	const COLUMN_WIDTHS: Record<string, number> = {
		name: 140,
		phone: 90,
		personalEmail: 170,
		workEmail: 170,
		address: 220,
		maskSize: 60,
		tshirtSize: 60,
		fitTestDate: 90
	};

	const widths = keys.map((k) => COLUMN_WIDTHS[k] ?? 100);

	const rowHeight = 18;
	let y = marginTop;
	const xStart = marginLeft;

	const drawText = (value: string, x: number, y: number, w: number) => {
		doc.text(value, x + 3, y + 4, { lineBreak: false, width: w - 6 });
	};

	const drawCellBox = (x: number, y: number, w: number, h: number) => {
		doc.rect(x, y, w, h).lineWidth(0.5).strokeColor('#cccccc').stroke().strokeColor('black');
	};

	function drawHeader() {
		doc.font('Helvetica-Bold').fontSize(9);
		let x = xStart;

		keys.forEach((k, i) => {
			const w = widths[i];
			drawCellBox(x, y, w, rowHeight);
			drawText(FIELD_LABELS[k] ?? k, x, y, w);
			x += w;
		});

		y += rowHeight;
		doc.font('Helvetica').fontSize(9);
	}

	function maybeNewPage() {
		if (y + rowHeight > doc.page.height - doc.page.margins.bottom - 40) {
			doc.addPage();
			y = doc.page.margins.top;
			drawHeader();
		}
	}

	drawHeader();

	for (const user of rows) {
		maybeNewPage();

		let x = xStart;

		keys.forEach((k, i) => {
			const w = widths[i];
			const val = getFieldValue(user, k);

			drawCellBox(x, y, w, rowHeight);
			drawText(val, x, y, w);

			x += w;
		});

		y += rowHeight;
	}
}

/* ----------------------------------------------------------
   MAIN PDF ROUTE
----------------------------------------------------------- */
export const POST: RequestHandler = async ({ request }) => {
	const { groups, fields } = await request.json();

	const db = await getDB();

	// Which roles are included
	const rolesToInclude: string[] = [];
	if (groups?.probationary) rolesToInclude.push('probationary');
	if (groups?.volunteer) rolesToInclude.push('volunteer');
	if (groups?.employee) rolesToInclude.push('employee');

	let query = db.select().from(users);

	if (rolesToInclude.length > 0) {
		query = query.where(
			inArray(
				sql`lower(${users.role})`,
				rolesToInclude.map((r) => r.toLowerCase())
			)
		);
	}

	const allUsers = await query.all();

	// Sort alphabetically
	const sortedUsers = [...allUsers].sort((a, b) => {
		const ln = (a.lastName ?? '').localeCompare(b.lastName ?? '');
		if (ln !== 0) return ln;
		return (a.firstName ?? '').localeCompare(b.firstName ?? '');
	});

	const selectedFields: string[] = Array.isArray(fields) ? fields : [];
	const otherFields = selectedFields.filter((f) => !['firstName', 'lastName'].includes(f));

	const fieldCount = 1 + otherFields.length; // always includes "Name"

	// Create PDF
	const doc = new PDFDocument({ size: 'LETTER', margin: 36 });
	const chunks: Uint8Array[] = [];

	const pdfBufferPromise: Promise<Buffer> = new Promise((resolve, reject) => {
		doc.on('data', (chunk) => chunks.push(chunk));
		doc.on('end', () => resolve(Buffer.concat(chunks)));
		doc.on('error', reject);
	});

	// TITLE
	doc.font('Helvetica-Bold').fontSize(18).text('NHFD Personnel Roster', { align: 'center' });

	const dateStr = new Date().toLocaleDateString();
	doc
		.moveDown(0.5)
		.font('Helvetica')
		.fontSize(10)
		.fillColor('#555')
		.text(`Generated ${dateStr}`, { align: 'center' })
		.moveDown(1)
		.fillColor('#000');

	// If empty
	if (sortedUsers.length === 0) {
		doc.text('No matching users found.', { align: 'center' });
	} else {
		if (fieldCount <= 4) {
			renderTwoPerRow(doc, sortedUsers, otherFields);
		} else {
			renderFullWidth(doc, sortedUsers, otherFields);
		}
	}

	// FOOTER
	doc.font('Helvetica').fontSize(8).fillColor('#777');
	doc.text(`Generated on ${dateStr}`, doc.page.margins.left, doc.page.height - 50, {
		align: 'left'
	});

	doc.end();
	const buffer = await pdfBufferPromise;

	return new Response(buffer, {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': 'inline; filename="roster.pdf"'
		}
	});
};
