import React, { Component } from 'react';

class App extends Component {
    state = {
        counter: 0,
        data:["a", "b", "c"]
    }

    componentDidMount() {
        this.setState({ counter: 1 });
    }

    buttonHandler = (e) => {
        this.setState((state) => {
            return { counter: state.counter + 1 };
        });
    }

    render() {
        let list = this.state.data.map((item, i) => {
            return (
                <li key={i}>{item}</li>
            );
        });
        
        return (
            <div>
                Hello World! {this.state.counter}
                <br />
                <button type="button" onClick={this.buttonHandler}>Click Me!</button>
                <ul>
                    {list}
                </ul>
            </div>
        )
    }
}

export default App;