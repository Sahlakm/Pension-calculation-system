function createPensionerFullView(db) {
	const today = new Date();

	return db
		.listCollections({ name: "pensioner_full_view" })
		.toArray()
		.then((collections) => {
			if (collections.length > 0) {
				return db.collection("pensioner_full_view").drop();
			}
		})
		.then(() => {
			return db.createCollection("pensioner_full_view", {
				viewOn: "pensiondetails",
				pipeline: [
					{
						$lookup: {
							from: "pensioners",
							localField: "PPoNo",
							foreignField: "PPoNo",
							as: "pensioner",
						},
					},
					{ $unwind: "$pensioner" },
					{
						$lookup: {
							from: "rules",
							localField: "pensioner.pension_rule",
							foreignField: "ruleName",
							as: "rule",
						},
					},
					{
						$unwind: {
							path: "$rule",
							preserveNullAndEmptyArrays: true,
						},
					},
					{
						$lookup: {
							from: "drvalues",
							let: { today: today },
							pipeline: [
								{
									$match: {
										$expr: {
											$and: [
												{ $lte: ["$from", today] },
												{ $gte: ["$to", today] },
											],
										},
									},
								},
							],
							as: "dr_value",
						},
					},
					{
						$unwind: {
							path: "$dr_value",
							preserveNullAndEmptyArrays: true,
						},
					},
					{
						$addFields: {
							basic_pension: {
								$ifNull: ["$rule.basic_pension", 0],
							},
							dr: { $ifNull: ["$dr_value.dr_value", 0] },
							total: {
								$add: [
									{ $ifNull: ["$rule.basic_pension", 0] },
									{ $ifNull: ["$dp_a", 0] },
								],
							},
							reduced_pension: {
								$add: [
									{ $ifNull: ["$rule.basic_pension", 0] },
									{ $ifNull: ["$dp_a", 0] },
								],
							},
							total_pension: {
								$add: [
									{
										$add: [
											{
												$ifNull: [
													"$rule.basic_pension",
													0,
												],
											},
											{ $ifNull: ["$dp_a", 0] },
										],
									},
									{ $ifNull: ["$dr", 0] },
									{ $ifNull: ["$medi_allowance", 0] },
									{ $ifNull: ["$other_allowance", 0] },
								],
							},
							total_deduction: {
								$add: [
									{ $ifNull: ["$other_deduction", 0] },
									{ $ifNull: ["$income_tax", 0] },
								],
							},
							net_pay: {
								$subtract: [
									{
										$add: [
											{
												$add: [
													{
														$ifNull: [
															"$rule.basic_pension",
															0,
														],
													},
													{ $ifNull: ["$dp_a", 0] },
												],
											},
											{ $ifNull: ["$dr", 0] },
											{ $ifNull: ["$medi_allowance", 0] },
											{
												$ifNull: [
													"$other_allowance",
													0,
												],
											},
										],
									},
									{
										$add: [
											{
												$ifNull: [
													"$other_deduction",
													0,
												],
											},
											{ $ifNull: ["$income_tax", 0] },
										],
									},
								],
							},
						},
					},
					{
						$project: {
							_id: 0,
							PPoNo: 1,
							name: "$pensioner.name",
							pension_rule: "$pensioner.pension_rule",
							rule_status: "$rule.isActive",
							employment_type: "$rule.employmentType",
							bank: "$pensioner.bank",
							address: "$pensioner.address",
							basic_pension: 1,
							dp_a: 1,
							total: 1,
							reduced_pension: 1,
							dr: 1,
							medi_allowance: 1,
							other_allowance: 1,
							total_pension: 1,
							income_tax: 1,
							other_deduction: 1,
							total_deduction: 1,
							net_pay: 1,
						},
					},
				],
			});
		});
}

module.exports = { createPensionerFullView };
