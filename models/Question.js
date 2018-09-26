const mongoose = require("mongoose");
const QuestionSchema = new mongoose.Schema({
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
	date_created: { type: Date, default: Date.now }
});
module.exports = mongoose.model("Question", QuestionSchema);
