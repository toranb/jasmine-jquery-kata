Person = (function($) {

  var PersonObject = function(params) {
    this.tbody = params.tbody;
    this.username = params.username;
    this.errors = params.errors;
    this.url = params.url;
  };

  PersonObject.prototype.addPerson = function() {
     var username = this.username.val();
     if (username.trim() === '') {
       this.errors.text('please enter a valid username');
     }else{
       this.errors.text('');
       this.doHttpPostWithPersonData(username);
     }
  };

  PersonObject.prototype.doHttpPostWithPersonData = function(username) {
    var data = {'username': username};
    var callback = this.addPersonCallback.bind(this);
    $.post(this.url, data, callback);
  };

  PersonObject.prototype.addPersonCallback = function(response) {
    var person = {'id': response['id'], 'username': response['username']};
    this.addPersonToHtml(response);
    this.username.val('');
  };

  PersonObject.prototype.addPersonToHtml = function(person) {
    var row = '<tr id="person_' + person['id'] + '">';
    row += ('<td>' + person['id'] + '</td>');
    row += ('<td>' + person['username'] + '</td>');
    row += ('<td><a href="#" onclick="person.removePerson(' + person['id'] + '); return false;">delete</a></td>');
    row += ('</tr>');
    this.tbody.append(row);
  };

  PersonObject.prototype.findAll = function() {
    var callback = this.findAllCallback.bind(this);
    $.getJSON(this.url, callback);
  };

  PersonObject.prototype.findAllCallback = function(response) {
    var self = this;
    response.forEach(function(person) {
      self.addPersonToHtml(person);
    });
  };

  PersonObject.prototype.removePerson = function(personId) {
    var url = this.url + '/' + personId;
    var callback = this.removePersonCallback.bind(this, personId);
    $.ajax({type: 'DELETE', url: url, success: callback});
  };

  PersonObject.prototype.removePersonCallback = function(personId) {
    $('table#people').find('tbody>tr[id="person_' + personId + '"]').remove();
  };

  return PersonObject;

})(jQuery);
