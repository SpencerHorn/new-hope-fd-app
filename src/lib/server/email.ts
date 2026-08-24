import nodemailer from 'nodemailer';

type AssignmentEmailPayload = {
	to: string;
	assigneeName: string;
	sopTitle: string;
	sopNumber: string;
	revisionDate: string;
	appUrl?: string;
};

let transporter: nodemailer.Transporter | null = null;

function getRequiredEnv(name: string): string {
	const value = (process.env[name] ?? '').trim();
	if (!value) {
		throw new Error(`Missing required environment variable: ${name}`);
	}
	return value;
}

function getTransporter() {
	if (transporter) {
		return transporter;
	}

	const host = getRequiredEnv('SMTP_HOST');
	const port = Number(process.env.SMTP_PORT ?? '587');
	const user = getRequiredEnv('SMTP_USER');
	const pass = getRequiredEnv('SMTP_PASS');
	const secure = String(process.env.SMTP_SECURE ?? '').toLowerCase() === 'true' || port === 465;

	transporter = nodemailer.createTransport({
		host,
		port,
		secure,
		auth: {
			user,
			pass
		}
	});

	return transporter;
}

function getFromAddress() {
	const fromName = (process.env.SMTP_FROM_NAME ?? 'New Hope FD').trim();
	const fromEmail = getRequiredEnv('SMTP_FROM_EMAIL');
	return `${fromName} <${fromEmail}>`;
}

export async function sendSopAssignmentEmail(payload: AssignmentEmailPayload) {
	const appUrl = (payload.appUrl ?? process.env.APP_BASE_URL ?? 'http://localhost:5173').replace(/\/$/, '');
	const dashboardUrl = `${appUrl}/dashboard`;

	const subject = `New SOP Task Assigned: ${payload.sopNumber} - ${payload.sopTitle}`;
	const text = [
		`Hello ${payload.assigneeName},`,
		'',
		'You have been assigned a new SOP task to review and complete.',
		`SOP: ${payload.sopNumber} - ${payload.sopTitle}`,
		`Revision Date: ${payload.revisionDate}`,
		'',
		`Please log in and view your Dashboard to open this task: ${dashboardUrl}`,
		'',
		'If you have any questions, contact your administrator.',
		'',
		'New Hope Fire Department'
	].join('\n');

	const html = `
		<p>Hello ${payload.assigneeName},</p>
		<p>You have been assigned a new SOP task to review and complete.</p>
		<p><strong>SOP:</strong> ${payload.sopNumber} - ${payload.sopTitle}<br />
		<strong>Revision Date:</strong> ${payload.revisionDate}</p>
		<p>Please log in and view your <a href="${dashboardUrl}">Dashboard</a> to open this task.</p>
		<p>If you have any questions, contact your administrator.</p>
		<p>New Hope Fire Department</p>
	`;

	await getTransporter().sendMail({
		from: getFromAddress(),
		to: payload.to,
		subject,
		text,
		html
	});
}