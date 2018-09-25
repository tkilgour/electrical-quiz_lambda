'use strict';
require('dotenv').config({ path: './variables.env' });
const connectToDatabase = require('./db');
const Question = require('./models/Question');


// helper functions
const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const getRandomSubset = (subsetNum, items) => {
  if (!items) return;
  const newItems = shuffle(items);
  return newItems.slice(0, subsetNum);
}

// exported functions
module.exports.createQuestion = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      Question.create(JSON.parse(event.body))
        .then(question => callback(null, {
          statusCode: 200,
          body: JSON.stringify(question)
        }))
        .catch(err => callback(null, {
          statusCode: err.statusCode || 500,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Could not create the question.'
        }));
    });
};

module.exports.getOneQuestion = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      Question.findById(event.pathParameters.id)
        .then(question => callback(null, {
          statusCode: 200,
          body: JSON.stringify(question)
        }))
        .catch(err => callback(null, {
          statusCode: err.statusCode || 500,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Could not fetch the question.'
        }));
    });
};

module.exports.updateQuestion = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      Question.findByIdAndUpdate(event.pathParameters.id, JSON.parse(event.body), { new: true })
        .then(question => callback(null, {
          statusCode: 200,
          body: JSON.stringify(question)
        }))
        .catch(err => callback(null, {
          statusCode: err.statusCode || 500,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Could not fetch the questions.'
        }));
    });
};

module.exports.deleteQuestion = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      Question.findByIdAndRemove(event.pathParameters.id)
        .then(question => callback(null, {
          statusCode: 200,
          body: JSON.stringify({ message: 'Removed question with id: ' + question._id, question: question })
        }))
        .catch(err => callback(null, {
          statusCode: err.statusCode || 500,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Could not fetch the questions.'
        }));
    });
};

module.exports.getAllQuestions = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      Question.find()
        .then(questions => callback(null, {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
            "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
          },
          body: JSON.stringify(questions)
        }))
        .catch(err => callback(null, {
          statusCode: err.statusCode || 500,
          headers: { 
            'Content-Type': 'text/plain',
          },
          body: 'Could not fetch the questions.'
        }))
    });
};

// quiz is a random subset of 20 questions with shuflled answers and answer.comment & answer.correct removed
module.exports.getQuiz = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      Question.find()
        .then(questions => {
          const randomSubset = getRandomSubset(20, questions);
          // loop through questions subset…
          for (let i in randomSubset) {
            // remove correct and comments…
            for (let j in randomSubset[i].answers) {
              const option = randomSubset[i].answers[j];
              randomSubset[i].answers[j] = { id: option.id, answer: option.answer };
            }
            
            // shuffle the answer order
            shuffle(randomSubset[i].answers);
          }
          callback(null, {
            statusCode: 200,
            headers: {
              "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
              "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
            },
            body: JSON.stringify(randomSubset)
          })
        })
        .catch(err => callback(null, {
          statusCode: err.statusCode || 500,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Could not fetch the questions.'
        }))
    });
};

module.exports.checkQuiz = (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  connectToDatabase()
    .then(() => {
      Question.find()
        .then(questions => {
          const answerFeedback = [];
          const selectedQuestions = JSON.parse(event.body);
          const quizQuestions = questions.filter(obj => {
            return obj._id in selectedQuestions;
          })

          for (let questionID in selectedQuestions) {
            const userAnswer = selectedQuestions[questionID];
            // answerFeedback.push(userAnswer)
            
            quizQuestions.forEach(question => {
              if (question._id == questionID) {
                let answerObj = {};
        
                answerObj._id = question._id;
                answerObj.correct = question.answers[userAnswer].correct;
                answerObj.comment = question.answers[userAnswer].comment;
        
                answerFeedback.push(answerObj);
              }
            });
          }
          
          callback(null, {
            statusCode: 200,
            headers: {
              "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
              "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS
            },
            body: JSON.stringify(answerFeedback)
          })
        })
        .catch(err => callback(null, {
          statusCode: err.statusCode || 500,
          headers: { 'Content-Type': 'text/plain' },
          body: 'Could not check quiz.'
        }));
    });
};
