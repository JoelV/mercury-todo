var hg = require('mercury');
var h = require('mercury').h;
var _ = require('underscore');
var uuid = require('uuid');
var temp = [
  {
    id: 1,
    task: 'foo'

  },
  {
    id: 2,
    task: 'bar'

  },
  {
    id: 3,
    task: 'baz'

  }
];
function App() {
  var state = hg.struct({
    addTodo: hg.value(''),
    handles: hg.value(null),
    todos: hg.array([])
  });

  state.handles.set(hg.handles({
    change: function(state, data) {
      state.addTodo.set(data.addTodo);
    },
    addToList: function(state) {
      var listObj = hg.struct({
        id: uuid.v4(),
        task: hg.value(state.addTodo())
      });
      state.todos.push(listObj);
      state.addTodo.set('');
    },
    removeFromList: function(state, data) {
      console.log(data);
      //var list = state.todos();
      var index;
      for(var i = 0; i < state.todos.getLength(); i++) {
        var item = state.todos.get(i);
        if(item.id === data.id) {
          index = i;
          break;
        }
      }
      state.todos.splice(index,1);
    }
  }, state));

  return state;
}
function inputBox(value, sink) {
  return h('input', {
    value: value,
    name: 'addTodo',
    type: 'text',
    placeholder: 'Add todo',
    'ev-event': hg.changeEvent(sink)
  });
}

function addButton(state) {
  return h('button.btn.btn-primary', { 
    style: { 'margin-left': '5px' },
    'ev-click': hg.event(state.handles.addToList)
  }, 'Add');
}

function deleteButton(state, id) {
  return h('button.btn.btn-xs.btn-danger.pull-right', {
    'ev-click': hg.event(state.handles.removeFromList, { id: id })
  },'Delete'); 
}

function list(state, todos) {
  return h('ul.list-group', 
    _.map(todos, function(todo) {
      return h('li.list-group-item', [
        todo.task,
        deleteButton(state, todo.id) 
      ]);
    })
  );
}

App.render = function render(state) {
  return h('div.container', [
    h('div.row', [ 
      h('div.col-md-3', [
        inputBox(state.addTodo, state.handles.change),
        addButton(state)
      ])
    ]),
    h('div.row', [
      h('div.col-md-6', list(state, state.todos))
    ])
  ]);
}

hg.app(document.body, App(), App.render);