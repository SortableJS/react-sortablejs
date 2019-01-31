import random from 'lodash/random';
import uniqueId from 'lodash/uniqueId';
import uniq from 'lodash/uniq';
import React from 'react';
import ReactDOM from 'react-dom';
import Sortable from '../src';

class App extends React.Component {
    state = {
        simpleList: [1, 2, 3, 4, 5, 6],
        groupLeft: ['Apple', 'Banana', 'Cherry', 'Grape'],
        groupRight: ['Lemon', 'Orange', 'Pear', 'Peach'],
        cloneUncontrolled: ['Apple', 'Banana', 'Cherry', 'Guava', 'Grape', 'Kiwi', 'Lemon', 'Melon', 'Orange', 'Pear', 'Peach', 'Strawberry'],
        cloneControlledSource: ['Apple', 'Banana', 'Cherry', 'Guava', 'Grape', 'Kiwi', 'Lemon', 'Melon', 'Orange', 'Pear', 'Peach', 'Strawberry'],
        cloneControlledTarget: []
    };

    simpleList = null;

    addMoreItems = () => {
        const items = [
            'Apple',
            'Banana',
            'Cherry',
            'Guava',
            'Grape',
            'Kiwi',
            'Lemon',
            'Melon',
            'Orange',
            'Pear',
            'Peach',
            'Strawberry'
        ];
        const i = random(0, items.length - 1);
        this.setState(state => ({
            groupLeft: state.groupLeft.concat(items[i])
        }));
    };

    render() {
        const simpleList = this.state.simpleList.map((val, key) => (
            <li key={uniqueId()} data-id={val}>List Item {val}</li>
        ));
        const groupLeft = this.state.groupLeft.map((val, key) => (
            <div key={uniqueId()} data-id={val}>{val}</div>
        ));
        const groupRight = this.state.groupRight.map((val, key) => (
            <div key={uniqueId()} data-id={val}>{val}</div>
        ));
        const cloneUncontrolled = this.state.cloneUncontrolled.map((val, key) => (
            <li key={uniqueId()} data-id={val}>{val}</li>
        ));
        const cloneControlledSource = this.state.cloneControlledSource.map((val, key) => (
            <li key={uniqueId()} data-id={val}>{val}</li>
        ));
        const cloneControlledTarget = this.state.cloneControlledTarget.map((val, key) => (
            <li key={uniqueId()} data-id={val}>{val}</li>
        ));

        return (
            <div>
                <div style={{ marginTop: 50 }}>
                    <div className="title">Simple List</div>
                    <div className="form-group">
                        <button
                            type="button"
                            className="btn btn-default"
                            onClick={(e) => {
                                const order = this.simpleList.toArray();
                                this.simpleList.sort(order.reverse());
                            }}
                        >
                            Reverse Order
                        </button>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <Sortable
                                options={{
                                    animation: 150
                                }}
                                className="block-list"
                                ref={c => {
                                    if (c) {
                                        this.simpleList = c.sortable;
                                    }
                                }}
                                tag="ul"
                            >
                                {simpleList}
                            </Sortable>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="title" style={{ marginTop: 50 }}>Shared Group</div>
                    <div className="form-group">
                        <button
                            type="button"
                            className="btn btn-default"
                            onClick={this.addMoreItems}
                        >
                            Add more items
                        </button>
                    </div>
                    <div className="row">
                        <div className="col-sm-6">
                            <Sortable
                                options={{
                                    animation: 150,
                                    group: {
                                        name: 'shared',
                                        pull: true,
                                        put: true
                                    }
                                }}
                                className="block-list"
                                onChange={(items) => {
                                    this.setState({ groupLeft: items });
                                }}
                            >
                                {groupLeft}
                            </Sortable>
                        </div>
                        <div className="col-sm-6">
                            <Sortable
                                options={{
                                    animation: 150,
                                    group: {
                                        name: 'shared',
                                        pull: true,
                                        put: true
                                    }
                                }}
                                className="block-list"
                                onChange={(items) => {
                                    this.setState({ groupRight: items });
                                }}
                            >
                                {groupRight}
                            </Sortable>
                        </div>
                    </div>
                </div>
                <div>
                    <div className="title" style={{ marginTop: 50 }}>Uncontrolled Component</div>
                    <h4>Clone items from left to right. DOM elements are duplicated.</h4>
                    <div className="row">
                        <div className="col-sm-6">
                            <Sortable
                                options={{
                                    animation: 150,
                                    sort: false,
                                    group: {
                                        name: 'clone1',
                                        pull: 'clone',
                                        put: false
                                    }
                                }}
                                className="block-list"
                                tag="ul"
                            >
                                {cloneUncontrolled}
                            </Sortable>
                        </div>
                        <div className="col-sm-6">
                            <Sortable
                                options={{
                                    animation: 150,
                                    group: {
                                        name: 'clone1',
                                        pull: false,
                                        put: true
                                    }
                                }}
                                className="block-list"
                                tag="ul"
                            />
                        </div>
                    </div>
                </div>
                <div>
                    <div className="title" style={{ marginTop: 50 }}>Controlled Component</div>
                    <h4>Clone items from left to right without duplication.</h4>
                    <div className="row">
                        <div className="col-sm-6">
                            <Sortable
                                options={{
                                    animation: 150,
                                    sort: false,
                                    group: {
                                        name: 'clone2',
                                        pull: true,
                                        put: true
                                    }
                                }}
                                className="block-list"
                                onChange={(items) => {
                                    this.setState({ cloneControlledSource: items });
                                }}
                                tag="ul"
                            >
                                {cloneControlledSource}
                            </Sortable>
                        </div>
                        <div className="col-sm-6">
                            <Sortable
                                options={{
                                    animation: 150,
                                    group: {
                                        name: 'clone2',
                                        pull: true,
                                        put: true
                                    }
                                }}
                                className="block-list"
                                onChange={(items) => {
                                    items = uniq(items); // Remove duplicate items
                                    this.setState({ cloneControlledTarget: items });
                                }}
                                tag="ul"
                            >
                                {cloneControlledTarget}
                            </Sortable>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('container')
);
