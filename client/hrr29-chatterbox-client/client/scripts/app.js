var app = {
  server: 'http://parse.hrr.hackreactor.com/chatterbox/classes/messages',
  username: 'anonymous',
  roomname: 'lobby',
  dataStore: [],
  friends: {},
  lastId: 0,

  init: function() {

    var input = window.location.search.split('=');
    app.username = input[input.length - 1];

    app.$message = $('#message');
    app.$chats = $('#chats');
    app.$roomSelect = $('#roomSelect');
    app.$send = $('#send');

    app.$chats.on('click', '.username', app.handleUsernameClick);
    app.$send.on('submit', app.handleSubmit);
    app.$roomSelect.on('change', app.handleRoomChange);

    app.startSpinner();
    app.fetch(false);

    setInterval(function() {
      app.fetch(true);
    }, 3000);

    setTimeout(function() { console.log(app.dataStore); }, 2000);
  },

  send: function(message) {
    app.startSpinner();

    $.ajax({
      url: app.server,
      type: 'POST',
      data: message,
      success: function (data) {
        console.log('Chatterbox: Message Sent');
        app.$message.val('');
        app.fetch();
      },
      error: function (error) {
        console.error('Chatterbox: Failed to Send Message', error);
      }
    });
  },

  handleSubmit: function(event) {
    var message = {
      username: app.username,
      text: app.$message.val(),
      roomname: app.roomname || 'lobby'
    };

    app.send(message);
    event.preventDefault();
  },

  fetch: function(animate) {
    $.ajax({
      url: app.server,
      type: 'GET',
      data: {order: '-createdAt'},
      contentType: 'application/json',
      success: function (data) {
        if (!data.results || !data.results.length) {
          return;
        }
        app.dataStore = data.results;
        var recent = data.results[data.results.length - 1];

        if (recent.objectId !== app.lastId) {
          app.renderRoomList(data.results);
          app.renderMessages(data.results, animate);
          app.lastId = recent.objectId;
        }
      },
      error: function (error) {
        console.error('Chatterbox: Failed to Receive Messages', error);
      }
    });
  },

  renderMessages: function(messages, animate) {
    app.clearMessages();
    app.stopSpinner();

    if (Array.isArray(messages)) {
      messages.filter(function(message) {
        return message.roomname === app.roomname || app.roomname === 'lobby' && !message.roomname;
      }).forEach(app.renderMessage);
    }
    if (animate) {
      $('body').animate({scrollTop: '0px'}, 'fast');
    }
  },

  renderMessage: function(message) {
    if (!message.roomname) {
      message.roomname = 'lobby';
    }

    var $chat = $('<div class="chat"></div>');

    var $username = $('<span class="username"/>');
    $username
      .text(message.username + ': ')
      .attr('data-roomname', message.roomname)
      .attr('data-username', message.username)
      .appendTo($chat);

    if (app.friends[message.username] === true) {
      $username.addClass('friend');
    }

    var $message = $('<br><span/>');
    $message.text(message.text).appendTo($chat);

    app.$chats.append($chat);
  },

  clearMessages: function() {
    app.$chats.html('');
  },

  cleanUp: function(message) {
    if (!string) {
      return;
    }
    return string.replace(/[&<>"'=\/]/g, '');
  },

  renderRoomList: function(messages) {
    app.$roomSelect.html('<option value="__newRoom">New Room...</option>');
    if (messages) {
      var rooms = {};
      messages.forEach(function(message) {
        var roomname = message.roomname;
        if (roomname && !rooms[roomname]) {
          app.renderRoom(roomname);

          rooms[roomname] = true;
        }
      });
    }
    app.$roomSelect.val(app.roomname);
  },

  renderRoom: function(roomname) {
    var $option = $('<option/>').val(roomname).text(roomname);
    app.$roomSelect.append($option);
  },

  handleRoomChange: function(event) {
    var selectIndex = app.$roomSelect.prop('selectedIndex');
    if (selectIndex === 0) {
      var roomname = prompt('Enter room name');
      if (roomname) {
        app.roomname = roomname;
        app.renderRoom(roomname);
        app.$roomSelect.val(roomname);
      }
    } else {
      app.startSpinner();
      app.roomname = app.$roomSelect.val();
    }
    app.renderMessages(app.dataStore);
  },

  handleUsernameClick: function(event) {
    var username = $(event.target).data('username');
    if (username !== undefined) {
      app.friends[username] = !app.friends[username];
      var selector = '[data-username="' + username.replace(/"/g, '\\\"' + '"]');
      var $usernames = $(selector).toggleClass('friend');
    }
  },

  startSpinner: function() {
    $('.spinner img').show();
    $('form input[type=submit]').attr('disabled', null);
  },

  stopSpinner: function() {
    $('.spinner img').fadeOut('fast');
    $('form input[type=submit]').attr('disabled', null);
  }

};

$('document').ready(function() {
  app.init();
});


