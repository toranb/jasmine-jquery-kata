require('static/script/app/person.js');

describe ("Person Test Suite", function(){

  var sut, url, $tbody, $username, $errors;

  beforeEach(function(){
    $(document.body).append('<div id="container"><table id="people"><tbody/></table><span id="errors"/><input type="text" id="username" name="username"/></div>');
    $tbody = $('#people > tbody');
    $username = $('#username');
    $errors = $('#errors');
    url = 'http://localhost:8000/people';
    sut = new Person({tbody: $tbody, url: url, username: $username, errors: $errors});
  });

  afterEach(function() {
    $('#container').remove();
  });

  describe ("constructor Tests", function(){

    it ("should make tbody available", function(){
      expect(sut.tbody).toBe($tbody);
    });

    it ("should make username available", function(){
      expect(sut.username).toBe($username);
    });

    it ("should make errors available", function(){
      expect(sut.errors).toBe($errors);
    });

    it ("should make url available", function(){
      expect(sut.url).toBe(url);
    });

  });

  describe ("addPerson Tests", function(){

    var postSpy;

    beforeEach(function(){
      postSpy = spyOn(sut, 'doHttpPostWithPersonData');
    });

    it ("should add username error when input is not valid", function(){
      sut.addPerson();
      expect($errors.text()).toBe('please enter a valid username');
    });

    it ("should not add username error when input is valid", function(){
      $username.val('foobar');
      sut.addPerson();
      expect($errors.text()).toBe('');
    });

    it ("should clear any previous error text when input is valid", function(){
      $errors.text('doh');
      expect($errors.text()).toBe('doh');
      $username.val('foobar');
      sut.addPerson();
      expect($errors.text()).toBe('');
    });

    it ("should not invoke doHttpPost when input is not valid", function(){
      $username.val('');
      sut.addPerson();
      expect(postSpy).not.toHaveBeenCalledWith(jasmine.any(String));
    });

    it ("should invoke doHttpPost with username value", function(){
      $username.val('foobar');
      sut.addPerson();
      expect(postSpy).toHaveBeenCalledWith('foobar');
    });

  });

  describe ("doHttpPostWithPersonData Tests", function() {

    var callback, bindSpy, postSpy;

    beforeEach(function(){
      callback = function(){};
      bindSpy = spyOn(sut.addPersonCallback, 'bind').andReturn(callback);
      postSpy = spyOn($, 'post');
    });

    it ("should invoke jQuery post with url", function() {
      sut.doHttpPostWithPersonData('foo');
      expect(postSpy).toHaveBeenCalledWith('http://localhost:8000/people', jasmine.any(Object), jasmine.any(Function));
    });

    it ("should invoke jQuery post with data", function() {
      var data = {'username': 'foo'};
      sut.doHttpPostWithPersonData('foo');
      expect(postSpy).toHaveBeenCalledWith(jasmine.any(String), data, jasmine.any(Function));
    });

    it ("should invoke jQuery post with callback", function() {
      sut.doHttpPostWithPersonData('foo');
      expect(postSpy).toHaveBeenCalledWith(jasmine.any(String), jasmine.any(Object), callback);
    });

  });

  describe ("addPersonCallback Tests", function(){

    var addSpy, response = {'id': 1, 'username': 'done'};

    beforeEach(function(){
      addSpy = spyOn(sut, 'addPersonToHtml');
    });

    it ("should invoke addPersonToHtml with response data", function(){
      var person = {'id': 1, 'username': 'done'};
      sut.addPersonCallback(response);
      expect(addSpy).toHaveBeenCalledWith(person);
    });

    it ("should clear the username field", function(){
      $username.val('blahblah');
      expect($username.val()).toBe('blahblah');
      sut.addPersonCallback(response);
      expect($username.val()).toBe('');
    });

  });

  describe ("removePerson Tests", function() {

    var callback, bindSpy, ajaxSpy, personId;

    beforeEach(function(){
      personId = 1234;
      callback = function(){};
      bindSpy = spyOn(sut.removePersonCallback, 'bind').andReturn(callback, personId);
      ajaxSpy = spyOn($, 'ajax');
    });

    it ("should invoke jQuery ajax with delete type", function() {
      sut.removePerson(personId);
      expect(ajaxSpy).toHaveBeenCalledWith({type:'DELETE', url:jasmine.any(String), success:jasmine.any(Function)});
    });

    it ("should invoke jQuery ajax with url", function() {
      sut.removePerson(personId);
      expect(ajaxSpy).toHaveBeenCalledWith({type:jasmine.any(String), url:'http://localhost:8000/people/1234', success:jasmine.any(Function)});
    });

    it ("should invoke jQuery ajax with callback", function() {
      sut.removePerson(personId);
      expect(ajaxSpy).toHaveBeenCalledWith({type:jasmine.any(String), url:jasmine.any(String), success:callback});
    });

  });

  describe ("removePersonCallback Tests", function() {

    beforeEach(function(){
      var first = $('<tr id="person_1234"><td></td></tr>');
      var last = $('<tr id="person_5678"><td></td></tr>');
      $('#people > tbody').append(first).append(last);
    });

    it ("should remove the tbody row given a specific personId to identify it", function() {
      expect($('table#people').find('tbody>tr').length).toEqual(2);
      sut.removePersonCallback(1234);
      expect($('table#people').find('tbody>tr').length).toEqual(1);
      expect($('table#people').find('tbody>tr[id="person_5678"]').html()).toBeTruthy();
    });

    it ("should not remove a tbody row when no matching personId found", function() {
      expect($('table#people').find('tbody>tr').length).toEqual(2);
      sut.removePersonCallback(9999);
      expect($('table#people').find('tbody>tr').length).toEqual(2);
    });

  });

  describe ("addPersonToHtml Tests", function(){

    var person = {'id': 9999, 'username': 'foo'};

    it ("should add row to tbody with personId", function(){
      sut.addPersonToHtml(person);
      expect($tbody.html()).toContain('<tr id="person_9999">');
    });

    it ("should add td with person id text", function(){
      sut.addPersonToHtml(person);
      expect($tbody.find("tr > td:eq(0)").html()).toBe('9999');
    });

    it ("should add td with person username text", function(){
      sut.addPersonToHtml(person);
      expect($tbody.find("tr > td:eq(1)").html()).toBe('foo');
    });

    it ("should add td with delete anchor tag", function(){
      sut.addPersonToHtml(person);
      expect($tbody.find("tr > td:eq(2)").html()).toBe('<a href="#" onclick="person.removePerson(9999); return false;">delete</a>');
    });

  });

  describe ("findAll Tests", function() {

    var callback, bindSpy, jsonSpy;

    beforeEach(function(){
      callback = function(){};
      bindSpy = spyOn(sut.findAllCallback, 'bind').andReturn(callback);
      jsonSpy = spyOn($, 'getJSON');
    });

    it ("should invoke jQuery getJSON with url", function() {
      sut.findAll();
      expect(jsonSpy).toHaveBeenCalledWith('http://localhost:8000/people', jasmine.any(Function));
    });

    it ("should invoke jQuery getJSON with callback", function() {
      sut.findAll();
      expect(jsonSpy).toHaveBeenCalledWith(jasmine.any(String), callback);
    });

  });

  describe ("buildListOfPeopleFromResponse Tests", function(){

    var first, last;

    beforeEach(function(){
      first = {'id':1, 'username':'foo'};
      last = {'id':2, 'username':'bar'};
    });

    it ("should return people containing a person with id attribute", function(){
      var response = [first];
      var people = sut.buildListOfPeopleFromResponse(response);
      expect(people[0].id).toBe(1);
    });

    it ("should return people containing a person with username attribute", function(){
      var response = [last];
      var people = sut.buildListOfPeopleFromResponse(response);
      expect(people[0].username).toBe('bar');
    });

    it ("should return a list containing an entry for each person in the response", function(){
      var response = [first, last];
      var people = sut.buildListOfPeopleFromResponse(response);
      expect(people.length).toBe(2);
    });

  });

  describe ("appendPeopleToHtml Tests", function(){

    var addSpy, first, last, people;

    beforeEach(function(){
      first = {'id':1, 'username':'foo'};
      last = {'id':2, 'username':'bar'};
      people = [first, last];
      addSpy = spyOn(sut, 'addPersonToHtml');
    });

    it ("should invoke addPersonToHtml with person", function(){
      sut.appendPeopleToHtml([first]);
      expect(addSpy).toHaveBeenCalledWith(first);
    });

    it ("should invoke addPersonToHtml for each person found in the list", function(){
      sut.appendPeopleToHtml(people);
      expect(addSpy.callCount).toBe(2);
    });

  });

  describe ("findAllCallback Tests", function(){

    var buildSpy, appendSpy, people;

    beforeEach(function(){
      people = [{'id':1, 'username':'foo'}]
      buildSpy = spyOn(sut, 'buildListOfPeopleFromResponse').andReturn(people);
      appendSpy = spyOn(sut, 'appendPeopleToHtml');
    });

    it ("should invoke buildListOfPeopleFromResponse with incoming response", function(){
      var response = {'some':'data'}
      sut.findAllCallback(response);
      expect(buildSpy).toHaveBeenCalledWith(response);
    });

    it ("should invoke appendPeopleToHtml with return value from buildListOfPeopleFromResponse", function(){
      sut.findAllCallback({});
      expect(appendSpy).toHaveBeenCalledWith(people);
    });

  });

});
