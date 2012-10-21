require('static/script/app/person.js');

describe ("Person Test Suite", function(){

  var sut, url, $tbody, $username, $errors;

  beforeEach(function(){
    $(document.body).append('<div id="container"><table id="people"><tbody/></table><span id="errors"/><input type="text" id="username" name="username"/></div>');
    $tbody = $('#people > tbody');
    $username = $('#username');
    $errors = $('#errors');
    url = 'http://localhost:8000/people';
    sut = new Person({tbody: $tbody, username: $username, errors: $errors, url: url});
  });

  afterEach(function() {
    $('#container').remove();
  });

  describe ("constructor Tests", function(){

    it ("#1 should define tbody on the instance", function(){
      expect(sut.tbody).toBeDefined();
    });

    it ("#2 should make tbody available to the object globally", function(){
      expect(sut.tbody.html()).toEqual($tbody.html());
    });

    it ("#3 should define username on the instance", function(){
      expect(sut.username).toBeDefined();
    });

    it ("#4 should make username available on the object globally", function(){
      expect(sut.username.html()).toBe($username.html());
    });

    it ("#5 should define errors on the instance", function(){
      expect(sut.errors).toBeDefined();
    });

    it ("#6 should make errors available on the object globally", function(){
      expect(sut.errors.html()).toBe($errors.html());
    });

    it ("#7 should define url on the instance", function(){
      expect(sut.url).toBeDefined();
    });

    it ("#8 should make url available on the object globally", function(){
      expect(sut.url).toBe(url);
    });

  });

  describe ("addPerson Tests", function(){

    var postSpy;

    beforeEach(function(){
      postSpy = spyOn(sut, 'doHttpPostWithPersonData');
    });

    it ("#9 should add username error when input is not valid", function(){
      sut.addPerson();
      expect($errors.text()).toBe('please enter a valid username');
    });

    it ("#10 should not add username error when input is valid", function(){
      $username.val('foobar');
      sut.addPerson();
      expect($errors.text()).toBe('');
    });

    it ("#11 should clear any previous error text when input is valid", function(){
      $errors.text('doh');
      expect($errors.text()).toBe('doh');
      $username.val('foobar');
      sut.addPerson();
      expect($errors.text()).toBe('');
    });

    it ("#12 should invoke doHttpPost with username value", function(){
      $username.val('foobar');
      sut.addPerson();
      expect(postSpy).toHaveBeenCalledWith('foobar');
    });

    it ("#13 should not invoke doHttpPost when input is not valid", function(){
      $username.val('');
      sut.addPerson();
      expect(postSpy).not.toHaveBeenCalledWith(jasmine.any(String));
    });

  });

  describe ("doHttpPostWithPersonData Tests", function() {

    var callback, bindSpy, postSpy;

    beforeEach(function(){
      callback = function(){};
      bindSpy = spyOn(sut.addPersonCallback, 'bind').andReturn(callback);
      postSpy = spyOn($, 'post');
    });

    it ("#14 should invoke jQuery post with url", function() {
      sut.doHttpPostWithPersonData('foo');
      expect(postSpy).toHaveBeenCalledWith('http://localhost:8000/people', jasmine.any(Object), jasmine.any(Function));
    });

    it ("#15 should invoke jQuery post with data", function() {
      var data = {'username': 'foo'};
      sut.doHttpPostWithPersonData('foo');
      expect(postSpy).toHaveBeenCalledWith(jasmine.any(String), data, jasmine.any(Function));
    });

    it ("#16 should invoke jQuery post with callback", function() {
      sut.doHttpPostWithPersonData('foo');
      expect(postSpy).toHaveBeenCalledWith(jasmine.any(String), jasmine.any(Object), callback);
    });

    it ("#17 should bind callback with the person instance", function() {
      sut.doHttpPostWithPersonData('foo');
      expect(bindSpy).toHaveBeenCalledWith(sut);
    });

  });

  describe ("addPersonCallback Tests", function(){

    var addSpy, response = {'id': 1, 'username': 'done'};

    beforeEach(function(){
      addSpy = spyOn(sut, 'addPersonToHtml');
    });

    it ("#18 should invoke addPersonToHtml with response data", function(){
      var person = {'id': 1, 'username': 'done'};
      sut.addPersonCallback(response);
      expect(addSpy).toHaveBeenCalledWith(person);
    });

    it ("#19 should clear the username field", function(){
      $username.val('blahblah');
      expect($username.val()).toBe('blahblah');
      sut.addPersonCallback(response);
      expect($username.val()).toBe('');
    });

  });

  describe ("addPersonToHtml Tests", function(){

    var person = {'id': 9999, 'username': 'foo'};

    it ("#20 should add row to tbody with personId", function(){
      sut.addPersonToHtml(person);
      expect($tbody.html()).toContain('<tr id="person_9999">');
    });

    it ("#21 should add td with person id text", function(){
      sut.addPersonToHtml(person);
      expect($tbody.find("tr > td:eq(0)").html()).toBe('9999');
    });

    it ("#22 should add td with person username text", function(){
      sut.addPersonToHtml(person);
      expect($tbody.find("tr > td:eq(1)").html()).toBe('foo');
    });

    it ("#23 should add td with delete anchor tag", function(){
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

    it ("#24 should invoke jQuery getJSON with url", function() {
      sut.findAll();
      expect(jsonSpy).toHaveBeenCalledWith('http://localhost:8000/people', jasmine.any(Function));
    });

    it ("#25 should invoke jQuery getJSON with callback", function() {
      sut.findAll();
      expect(jsonSpy).toHaveBeenCalledWith(jasmine.any(String), callback);
    });

    it ("#26 should bind callback with the person instance", function() {
      sut.findAll();
      expect(bindSpy).toHaveBeenCalledWith(sut);
    });

  });

  describe ("findAllCallback Tests", function(){

    var addSpy, first, last, people;

    beforeEach(function(){
      first = {'id':1, 'username':'foo'};
      last = {'id':2, 'username':'bar'};
      people = [first, last];
      addSpy = spyOn(sut, 'addPersonToHtml');
    });

    it ("#27 should invoke addPersonToHtml with person", function(){
      sut.findAllCallback([first]);
      expect(addSpy).toHaveBeenCalledWith(first);
    });

    it ("#28 should invoke addPersonToHtml for each person found in the list", function(){
      sut.findAllCallback(people);
      expect(addSpy.callCount).toBe(2);
    });

  });

  describe ("removePerson Tests", function() {

    var callback, bindSpy, ajaxSpy, personId;

    beforeEach(function(){
      personId = 1234;
      callback = function(){};
      bindSpy = spyOn(sut.removePersonCallback, 'bind').andReturn(callback);
      ajaxSpy = spyOn($, 'ajax');
    });

    it ("#29 should invoke jQuery ajax with delete type", function() {
      sut.removePerson(personId);
      expect(ajaxSpy).toHaveBeenCalledWith({type:'DELETE', url:jasmine.any(String), success:jasmine.any(Function)});
    });

    it ("#30 should invoke jQuery ajax with url", function() {
      sut.removePerson(personId);
      expect(ajaxSpy).toHaveBeenCalledWith({type:jasmine.any(String), url:'http://localhost:8000/people/1234', success:jasmine.any(Function)});
    });

    it ("#31 should invoke jQuery ajax with callback", function() {
      sut.removePerson(personId);
      expect(ajaxSpy).toHaveBeenCalledWith({type:jasmine.any(String), url:jasmine.any(String), success:callback});
    });

    it ("#32 should bind callback with both the person instance and person id value", function() {
      sut.removePerson(personId);
      expect(bindSpy).toHaveBeenCalledWith(sut, personId);
    });

  });

  describe ("removePersonCallback Tests", function() {

    beforeEach(function(){
      var first = $('<tr id="person_1234"><td></td></tr>');
      var last = $('<tr id="person_5678"><td></td></tr>');
      $('#people > tbody').append(first).append(last);
    });

    it ("#33 should remove the tbody row given a specific personId to identify it", function() {
      expect($('table#people').find('tbody>tr').length).toEqual(2);
      sut.removePersonCallback(1234);
      expect($('table#people').find('tbody>tr').length).toEqual(1);
      expect($('table#people').find('tbody>tr[id="person_5678"]').html()).toBeTruthy();
    });

    it ("#34 should not remove a tbody row when no matching personId found", function() {
      expect($('table#people').find('tbody>tr').length).toEqual(2);
      sut.removePersonCallback(9999);
      expect($('table#people').find('tbody>tr').length).toEqual(2);
    });

  });

});
