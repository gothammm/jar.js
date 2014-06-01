jar.store('Test.services.classone', {
    init: function () {
        console.log('class instantiated');
        console.log('Setting varialbe "name"');
        this.name = "John";
    },
    //custom methods & variables
    custom_method: function () {
        return this.name;
    }
});