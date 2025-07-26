import React from "react";

const comparativeData = [
	{
		label: "Magnetómetro",
		madTrackers: "Sí",
		comunes: "No(*)",
	},
	{
		label: "Batería",
		madTrackers: "50-70 horas (300mah)",
		comunes: "5-7 horas (1200mah)",
	},
	{
		label: "Tecnología",
		madTrackers: "Enhanced ShockBurst",
		comunes: "WiFi",
	},
	{
		label: "Materiales",
		madTrackers: "PETG",
		comunes: "PLA+",
	},
	{
		label: "Tamaño",
		madTrackers: "38 x 38 x 10 mm",
		comunes: "40 x 70 x 20 mm",
	},
	{
		label: "Peso",
		madTrackers: "~25g",
		comunes: "~65g",
	},
];

export default function ComparativeTable() {
	return (
		<div className="flex justify-center py-8" style={{ background: "#fff" }}>
			<div
				className="bg-white text-black rounded-xl shadow-lg p-6 w-full max-w-2xl border border-gray-200"
				style={{ background: "#fff", borderTop: "1px solid #e5e7eb", borderBottom: "1px solid #e5e7eb", marginTop: 0, marginBottom: 0 }}
			>
				<h2 className="text-xl font-bold mb-4 text-center">
					Comparativa de Trackers
				</h2>
				<div className="overflow-x-auto w-full">
					<table className="w-full min-w-[320px] text-xs sm:text-sm">
						<thead>
							<tr className="bg-gray-100">
								<th className="py-1 px-1 sm:py-2 sm:px-2 border-b"></th>
								<th className="py-1 px-1 sm:py-2 sm:px-2 border-b">Otros trackers</th>
								<th className="py-1 px-1 sm:py-2 sm:px-2 border-b">madTrackers</th>
							</tr>
						</thead>
						<tbody>
							{comparativeData.map((row) => (
								<tr key={row.label} className="text-center">
									<td className="py-1 px-1 sm:py-2 sm:px-2 border-b font-semibold text-left">
										{row.label}
									</td>
									<td className="py-1 px-1 sm:py-2 sm:px-2 border-b">{row.comunes}</td>
									<td className="py-1 px-1 sm:py-2 sm:px-2 border-b">{row.madTrackers}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<div className="text-xs text-gray-500 mt-2">
					(*) Algunos trackers comunes pueden tener magnetómetro,
					pero generalmente no está habilitado por falta de soporte oficial
					en los modelos WiFi. Solo algunos sensores antiguos,
					como el BNO085, cuentan con soporte.
				</div>
			</div>
		</div>
	);
}
