<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	let step = 1;

	// Step 1: User groups to include
	let includeProbationary = true;
	let includeVolunteer = true;
	let includeEmployee = true;

	// Step 2: Fields to include in the roster
	const availableFields = [
		{ key: 'lastName', label: 'Last Name' },
		{ key: 'firstName', label: 'First Name' },
		{ key: 'address', label: 'Address' },
		{ key: 'phone', label: 'Phone' },
		{ key: 'personalEmail', label: 'Personal Email' },
		{ key: 'workEmail', label: 'Work Email' },
		{ key: 'tshirtSize', label: 'T-shirt Size' },
		{ key: 'maskSize', label: 'Mask Size' },
		{ key: 'fitTestDate', label: 'Fit Test Date' }
	];

	let selectedFields: string[] = ['lastName', 'firstName'];

	function toggleField(key: string) {
		if (selectedFields.includes(key)) {
			selectedFields = selectedFields.filter((f) => f !== key);
		} else {
			selectedFields = [...selectedFields, key];
		}
	}

	async function exportCSV() {
		const body = {
			groups: {
				probationary: includeProbationary,
				volunteer: includeVolunteer,
				employee: includeEmployee
			},
			fields: selectedFields
		};

		const res = await fetch('/api/roster/csv', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});

		const blob = await res.blob();
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = 'roster.csv';
		a.click();

		URL.revokeObjectURL(url);
	}

	async function exportPDF() {
		const body = {
			groups: {
				probationary: includeProbationary,
				volunteer: includeVolunteer,
				employee: includeEmployee
			},
			fields: selectedFields
		};

		const res = await fetch('/api/roster/pdf', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		});

		const blob = await res.blob();
		const url = URL.createObjectURL(blob);
		window.open(url, '_blank');
	}
</script>

<div class="overlay" on:click={() => dispatch('close')}></div>

<div class="modal">
	<!-- STEP 1: User Types -->
	{#if step === 1}
		<h2>Create Roster</h2>
		<p>Select which users to include:</p>

		<label><input type="checkbox" bind:checked={includeProbationary} /> Probationary</label>
		<label><input type="checkbox" bind:checked={includeVolunteer} /> Volunteer</label>
		<label><input type="checkbox" bind:checked={includeEmployee} /> Employee</label>

		<div class="actions">
			<button on:click={() => dispatch('close')}>Cancel</button>
			<button on:click={() => (step = 2)}>Next</button>
		</div>
	{/if}

	<!-- STEP 2: Choose Fields -->
	{#if step === 2}
		<h2>Select Fields</h2>
		<p>Choose what information to include in the roster:</p>

		<div class="field-list">
			{#each availableFields as f}
				<label>
					<input
						type="checkbox"
						checked={selectedFields.includes(f.key)}
						on:change={() => toggleField(f.key)}
					/>
					{f.label}
				</label>
			{/each}
		</div>

		<div class="actions">
			<button on:click={() => (step = 1)}>Back</button>
			<button on:click={() => (step = 3)}>Next</button>
		</div>
	{/if}

	<!-- STEP 3: Export -->
	{#if step === 3}
		<h2>Export Roster</h2>
		<p>Choose export format:</p>

		<div class="export-buttons">
			<button on:click={exportCSV}>Export CSV</button>
			<button on:click={exportPDF}>Print to PDF</button>
		</div>

		<div class="actions">
			<button on:click={() => dispatch('close')}>Close</button>
		</div>
	{/if}
</div>

<style>
	.overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(4px);
	}

	.modal {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: white;
		padding: 1.75rem;
		border-radius: 14px;
		min-width: 360px;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
	}

	label {
		display: block;
		margin: 6px 0;
		font-size: 0.95rem;
	}

	.actions {
		display: flex;
		justify-content: space-between;
		margin-top: 1rem;
	}

	.export-buttons {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin-top: 1rem;
	}

	button {
		padding: 0.6rem 1rem;
		border-radius: 8px;
		border: none;
		background: #111827;
		color: white;
		cursor: pointer;
	}

	button:hover {
		background: #333;
	}
</style>
