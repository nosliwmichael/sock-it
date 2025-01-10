import React from 'react';

const QuizRandomScreen = ({ welcomeMessage, socket }) => {

  return (
    <div className="QuizRandomScreen">
      <header className="App-header">
        <h1>{welcomeMessage}</h1>
      </header>
    </div>
  );
};

export default QuizRandomScreen;