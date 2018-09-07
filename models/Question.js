const mongoose = require("mongoose");
const QuestionSchema = new mongoose.Schema({
	question: String,
	answers: [
		{
			id: Number,
			answer: String,
			correct: Boolean,
			comment: String
		}
	],
	tags: [String]
});
module.exports = mongoose.model("Question", QuestionSchema);
