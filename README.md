# SlideToConfirm (STC) Modal
Used to confirm with sliding til 100% otherwise this will not perform confirm callback function.

```javascript
var confirmModal = new Modal({
    content: '<h4>Do you want to confirm this transaction?</h4>',
    confirmationMessage: 'Transaction successfully confirmed.',
    confirmCallback: function (value, modal) {
        // Do confirmed actions
    }
});

confirmModal.open();
```

####Todos
- Add Demo page
- Add to npm

####Docs
https://amirkhiz.github.io/slide-to-confirm/