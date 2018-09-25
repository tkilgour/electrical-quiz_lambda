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
	tags: [String]
});
module.exports = mongoose.model("Question", QuestionSchema);
