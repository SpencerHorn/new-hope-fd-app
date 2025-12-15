export function printChecklist({
	userName,
	checklistName,
	items
}: {
	userName?: string;
	checklistName: string;
	items: {
		number: number;
		taskName: string;
		completed?: boolean;
		dateCompleted?: string | null;
	}[];
}) {
	const win = window.open('', '_blank');
	if (!win) return;

	const rows = items
		.map(
			(item) => `
			<tr>
				<td>${item.number}</td>
				<td>${item.taskName}</td>
				<td class="checkbox">${item.completed ? '☑' : '☐'}</td>
				<td>${item.dateCompleted ? new Date(item.dateCompleted).toLocaleDateString() : ''}</td>
			</tr>
		`
		)
		.join('');

	win.document.write(`
		<html>
			<head>
				<title>${checklistName}</title>
				<style>
					body {
						font-family: Arial, sans-serif;
						padding: 24px;
					}

					p {
						margin: 0 0 6px 0;
						color: #555;
					}

					table {
						width: 100%;
						margin-top: 20px;
						border-collapse: separate;
						border-spacing: 0;
					}

					th {
						border: 1px solid #ccc;
						padding: 10px;
						text-align: left;
						background: #f3f4f6;
					}

					td {
						border-bottom: 1px solid #ccc;
						border-left: 1px solid #ccc;
						border-right: 1px solid #ccc;
						padding: 10px;
						height: 42px;
						vertical-align: middle;
					}

					tr:first-child td {
						border-top: 1px solid #ccc;
					}

					td.checkbox {
						text-align: center;
						font-size: 18px;
					}

					.footer {
						margin-top: 30px;
						font-size: 12px;
						color: #777;
					}
				</style>
			</head>
			<body>
				<h1>${checklistName}</h1>
				${userName ? `<p>User: ${userName}</p>` : ''}
				<p>Date Printed: ${new Date().toLocaleDateString()}</p>

				<table>
					<thead>
						<tr>
							<th style="width:50px;">#</th>
							<th>Task</th>
							<th style="width:100px;text-align:center;">Completed</th>
							<th style="width:120px;">Date</th>
						</tr>
					</thead>
					<tbody>
						${rows}
					</tbody>
				</table>

				<div class="footer">
					New Hope Fire Department – Training Checklist
				</div>

				<script>
					window.print();
					window.onafterprint = () => window.close();
				</script>
			</body>
		</html>
	`);

	win.document.close();
}
