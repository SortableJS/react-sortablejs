# react-sortable [![build status](https://travis-ci.org/cheton/react-sortable.svg?branch=master)](https://travis-ci.org/cheton/react-sortable) [![Coverage Status](https://coveralls.io/repos/github/cheton/react-sortable/badge.svg?branch=master)](https://coveralls.io/github/cheton/react-sortable?branch=master)

[![NPM](https://nodei.co/npm/react-sortablejs.png?downloads=true&stars=true)](https://www.npmjs.com/package/react-sortablejs)

A React component built on top of Sortable (https://github.com/RubaXa/Sortable).

- Demo: http://cheton.github.io/react-sortable

The [sample code](https://github.com/cheton/react-sortable/blob/master/examples/index.jsx) can be found in the [examples](https://github.com/cheton/react-sortable/tree/master/examples) directory.

## Notice
There is a major breaking change since v1.0. Checkout [Migration Guide](https://github.com/cheton/react-sortable/wiki/Migration-Guide) while upgrading from earlier versions.

## Installation

### Webpack or Browserify
The easiest way to use react-sortablejs is to install it from npm and include it in your React build process using webpack or browserify.
```bash
npm install --save react react-dom sortablejs@1.6.1  # Install peerDependencies
npm install --save react-sortablejs
```

Checkout the [examples](https://github.com/cheton/react-sortable/tree/dev/examples) directory for a complete setup.

### Standalone ES5 module
You can create a standalone ES5 module as shown below:
```bash
$ git clone https://github.com/cheton/react-sortable.git
$ cd react-sortable
$ npm install
$ npm run build && npm run dist
```

Then, include these scripts into your html file:
```html
<body>
  <div id="container"></div>
  <script src="http://fb.me/react-0.14.7.js"></script>
  <script src="http://fb.me/react-dom-0.14.7.js"></script>
  <script src="http://cdnjs.cloudflare.com/ajax/libs/Sortable/1.4.2/Sortable.min.js"></script>
  <script src="dist/react-sortable.min.js"></script>
</body>
```

Use <b>&lt;ReactSortable /&gt;</b> instead of <b>&lt;Sortable /&gt;</b> in your JSX code since the Sortable library will export a <b>window.Sortable</b> object if you're running JSX code directly in the browser. For example:
```js
<ReactSortable
    tag="ul"
    onChange={(order) =>
        this.props.onChange(order);
    }}
>
    {items}
</ReactSortable>
```

## Usage
File: sortable-list.jsx
```js
import uniqueId from 'lodash/uniqueId';
import React from 'react';
import Sortable from 'react-sortablejs';

// Functional Component
const SortableList = ({ items, onChange }) => {
    let sortable = null; // sortable instance
    const reverseOrder = (evt) => {
        const order = sortable.toArray();
        onChange(order.reverse());
    };
    const listItems = items.map(val => (<li key={uniqueId()} data-id={val}>List Item: {val}</li>));

    return (
        <div>
            <button type="button" onClick={reverseOrder}>Reverse Order</button>
            <Sortable
                // Sortable options (https://github.com/RubaXa/Sortable#options)
                options={{
                }}

                // [Optional] Use ref to get the sortable instance
                // https://facebook.github.io/react/docs/more-about-refs.html#the-ref-callback-attribute
                ref={(c) => {
                    if (c) {
                        sortable = c.sortable;
                    }
                }}

                // [Optional] A tag or react component to specify the wrapping element. Defaults to "div".
                // In a case of a react component it is required to has children in the component
                // and pass it down.
                tag="ul"

                // [Optional] The onChange method allows you to implement a controlled component and keep
                // DOM nodes untouched. You have to change state to re-render the component.
                // @param {Array} order An ordered array of items defined by the `data-id` attribute.
                // @param {Object} sortable The sortable instance.
                // @param {Event} evt The event object.
                onChange={(order, sortable, evt) => {
                    onChange(order);
                }}
            >
                {listItems}
            </Sortable>
        </div>
    );
};

SortableList.propTypes = {
    items: React.PropTypes.array,
    onChange: React.PropTypes.func
};

export default SortableList;
```

File: index.jsx
```js
import React from 'react';
import ReactDOM from 'react-dom';
import SortableList from './sortable-list';

class App extends React.Component {
    state = {
        items: [1, 2, 3, 4, 5, 6]
    };

    render() {
        return (
            <SortableList
                items={this.state.items}
                onChange={(items) => {
                    this.setState({ items });
                }}
            >
            </SortableList>
        )
    }
};

ReactDOM.render(
    <App />,
    document.getElementById('container')
);
```

## Examples

### Uncontrolled Component
An uncontrolled component allows [Sortable](https://github.com/RubaXa/Sortable) to touch DOM nodes. It's useful when you don't need to maintain any state changes.

```js
import uniqueId from 'lodash/uniqueId';
import React from 'react';
import ReactDOM from 'react-dom';
import Sortable from 'react-sortablejs';

class App extends React.Component {
    state = {
        items: ['Apple', 'Banana', 'Cherry', 'Guava', 'Peach', 'Strawberry']
    };

    render() {
        const items = this.state.items.map(val => (<li key={uniqueId()} data-id={val}>{val}</li>));

        return (
            <div>
                <Sortable
                    tag="ul" // Defaults to "div"
                >
                    {items}
                </Sortable>
            </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('container')
);
```

### Controlled Component
A controlled component will keep DOM nodes untouched. You have to change state to re-render the component.

```js
import uniqueId from 'lodash/uniqueId';
import React from 'react';
import ReactDOM from 'react-dom';
import Sortable from 'react-sortablejs';

class App extends React.Component {
    state = {
        items: ['Apple', 'Banana', 'Cherry', 'Guava', 'Peach', 'Strawberry']
    };

    render() {
        const items = this.state.items.map(val => (<li key={uniqueId()} data-id={val}>{val}</li>));

        return (
            <div>
                <Sortable
                    tag="ul" // Defaults to "div"
                    onChange={(order, sortable, evt) => {
                        this.setState({ items: order });
                    }}
                >
                    {items}
                </Sortable>
            </div>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('container')
);
```

### Shared Group
An example of using the `group` option to drag elements from one list into another.

File: shared-group.jsx
```js
import uniqueId from 'lodash/uniqueId';
import React from 'react';
import Sortable from 'react-sortablejs';

// Functional Component
const SharedGroup = ({ items }) => {
    items = items.map(val => (<li key={uniqueId()} data-id={val}>{val}</li>));

    return (
        <Sortable
            // See all Sortable options at https://github.com/RubaXa/Sortable#options
            options={{
                group: 'shared'
            }}
            tag="ul"
        >
            {items}
        </Sortable>
    );
};

export default SharedGroup;
```

File: index.jsx
```js
import React from 'react';
import ReactDOM from 'react-dom';
import SharedGroup from './shared-group';

const App = (props) => {
    return (
        <div>
            <SharedGroup
                items={['Apple', 'Banaba', 'Cherry', 'Grape']}
            />
            <br/>
            <SharedGroup
                items={['Lemon', 'Orange', 'Pear', 'Peach']}
            />
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('container'));
```
