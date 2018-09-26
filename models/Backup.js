const mongoose = require("mongoose");
const BackupSchema = new mongoose.Schema({
	backup_date: { type: Date, default: Date.now },
	questions: [
		{
			_id: String,
			question: String,
			correct: Number,
			answers: [
				{
					id: Number,
					answer: String,
					comment: String
				}
			],
			tags: [String],
			date_created: Date
		}
	]
});
module.exports = mongoose.model("Backup", BackupSchema);
