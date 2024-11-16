import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function App() {
  const [expression, setExpression] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [ans, setAns] = useState('0');
  const scrollViewRef = useRef();
  const deleteInterval = useRef(null);
  const deleteTimeout = useRef(null);

  const handlePress = (val) => {
    if (val === '=') {
      try {
        const evaluatedResult = eval(expression);
        setAns(evaluatedResult.toString());
        setHistory([...history, { expression, result: evaluatedResult.toString() }]);
        const newExpression = evaluatedResult.toString();
        setExpression(newExpression);
        setResult('');
        setCursorPosition(newExpression.length); 
      } catch (error) {
        setResult('Error');
      }
    } else if (val === 'Ans') {
      const newExpression = expression.slice(0, cursorPosition) + ans + expression.slice(cursorPosition);
      setExpression(newExpression);
      setCursorPosition(cursorPosition + ans.length);
      calculateResult(newExpression);
    } else if (val === 'C') {
      setExpression('');
      setResult('');
    } else if (val === '⌫') {
      const newExpression = expression.slice(0, cursorPosition - 1) + expression.slice(cursorPosition);
      setExpression(newExpression);
      setCursorPosition(cursorPosition > 0 ? cursorPosition - 1 : 0);
      calculateResult(newExpression);
    } else {
      const newExpression = expression.slice(0, cursorPosition) + val + expression.slice(cursorPosition);
      setExpression(newExpression);
      setCursorPosition(cursorPosition + 1);
      calculateResult(newExpression);
    }
  };

  const handleBackspacePressIn = () => {
    handlePress('⌫')
    deleteTimeout.current = setTimeout(handlePress('⌫'), 100);
  };

  const handleBackspacePressOut = () => {
    clearTimeout(deleteTimeout.current);
    deleteTimeout.current = null;
  };

  const calculateResult = (exp) => {
    try {
      const evaluatedResult = eval(exp);
      setResult(evaluatedResult.toString());
    } catch (error) {
      setResult('');
    }
  };

  const clearHistory = () => {
    setHistory([]);
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }

    return () => {
      if (deleteInterval.current) {
        cancelAnimationFrame(deleteInterval.current);
      }
    };
  }, [history]);

  const renderButton = (val) => (
    <TouchableOpacity
      style={styles.button}
      onPress={() => handlePress(val)}
      onPressIn={val === '⌫' ? handleBackspacePressIn : null}
      onPressOut={val === '⌫' ? handleBackspacePressOut : null}
      // onLongPress={() => {
      //   console.log("Long Press")
      // }}
      // onPressOut={() => {
      //   if (val === '⌫') {
      //       deleteInterval.current = setInterval(() => {
      //       handlePress('⌫');
      //       }, 100);
      //     clearInterval(deleteInterval.current);
      //     deleteInterval.current = null;
      //   }
      //   console.log("Press Out")
      // }}
      // delayLongPress={500}
      key={val}
    >
      <Text style={styles.buttonText}>{val}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.historyHeader}>
        <TouchableOpacity onPress={clearHistory}>
          <Text style={styles.clearHistoryText}>Clear History</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        ref={scrollViewRef}
        style={styles.historyContainer}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
      >
        {history.map((item, index) => (
          <View key={index} style={styles.historyItem}>
            <Text style={styles.historyText}>{item.expression} = {item.result}</Text>
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.display}>
        <TextInput
          style={styles.displayText}
          value={expression}
          onChangeText={(text) => {
            setExpression(text);
            calculateResult(text);
          }}
          placeholder="0"
          placeholderTextColor="#555"
          keyboardType="numeric"
          editable={true}
          showSoftInputOnFocus={false}
          selection={{ start: cursorPosition, end: cursorPosition }}
          onSelectionChange={(event) => {
            setCursorPosition(event.nativeEvent.selection.start);
          }}
        />
        <Text style={styles.resultText}>{result}</Text>
      </View>

      <View style={styles.buttonContainer}>
        {['Ans'].map(renderButton)}
        <View style={[styles.splitButtonContainer]}>
          <TouchableOpacity style={[styles.splitButton, styles.splitButtonLeft]} onPress={() => handlePress('(')}>
            <Text style={styles.buttonText}>(</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.splitButton, styles.splitButtonRight]} onPress={() => handlePress(')')}>
            <Text style={styles.buttonText}>)</Text>
          </TouchableOpacity>
        </View>

        {['⌫', '+'].map(renderButton)}
        {['1', '2', '3', '-'].map(renderButton)}
        {['4', '5', '6', '*'].map(renderButton)}
        {['7', '8', '9', '/'].map(renderButton)}
        {['C', '0', '.', '='].map(renderButton)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  historyHeader: {
    padding: 15,
    marginTop: 20,
    backgroundColor: '#000',
    alignItems: 'flex-start',
  },
  // clearHistoryContainer: {
  //   backgroundColor: '#f44336',
  //   padding: 10,
  // },
  clearHistoryText: {
    // backgroundColor: '#f44336',
    color: '#fff',
    fontSize: 16,
  },
  historyContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: '#222',
  },
  historyItem: {
    marginBottom: 5,
    alignItems: 'flex-end',
  },
  historyText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'right',
  },
  display: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 5,
    backgroundColor: '#222',
  },
  displayText: {
    color: '#fff',
    fontSize: 36,
    width: '100%',
    textAlign: 'right',
  },
  resultText: {
    color: '#4caf50',
    fontSize: 24,
  },
  buttonContainer: {
    flex: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 5,
  },
  splitButtonContainer: {
    flexDirection: 'row',
    width: '22%',
    margin: '1%',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    overflow: 'hidden',
  },
  splitButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#333',
  },
  splitButtonLeft: {
    marginRight: 1,
  },
  splitButtonRight: {
    marginLeft: 1,
  },
  button: {
    width: '22%',
    margin: '1%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
  },
});
