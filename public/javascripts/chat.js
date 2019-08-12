$(function () {
    // $(document).ready(function() {
    //     $('input#input_text, textarea#textarea2').characterCounter();
    //
    // });
    function readURL(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('#blah').attr('src', e.target.result);
            }
            reader.readAsDataURL(input.files[0]);
        }
    }
    function readURL2(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                $('#blah2').attr('src', e.target.result);
            }
            reader.readAsDataURL(input.files[0]);
        }
    }
    $("#eric-file-input").click(function () {
        document.getElementById('avatar').click();
        $('.d-inline').change(function(e){
            readURL(this);
        });
    });
    $("#eric-file-input2").click(function () {
        document.getElementById('image').click();
        $('.d-inline2').change(function(e){
            readURL2(this);
        });

    });
    $('.eric-hide-btn').click(function(){
        $('.eric-hide-item').toggle('slow');
    });
    var messagelist= document.querySelectorAll('.eric-message');
    console.log(messagelist)
    messagelist.forEach(function (el,number) {
        console.log(el.className);
        $(el).click(function(){
            console.log('.message-body'+number);
            $('.message-body'+number).toggle('slow');
        });
    })
    /*****************add favourite*******************************/

    const alarmList=document.querySelectorAll('.addFT');

    loadEventListener();
    function loadEventListener() {
       console.log(alarmList);

        alarmList.forEach(function(element) {
            element.addEventListener('click',removeAlarm);
        });

    }
    function removeAlarm(e) {
        e.preventDefault();
        console.log('i am hereeeeeeee add!'+e.target.parentElement.href);
        if(e.target.parentElement.classList.contains('addFT') ){

            $.get(e.target.parentElement.href);
             e.target.parentElement.style="pointer-events: none; cursor: default;";
            e.target.style="color:red;";

            var integer = parseInt(e.target.innerHTML, 10);

            e.target.innerHTML=integer+1;
        }
    }
   /**********************************************************************/
    /*****************add favourite details*******************************/
    // $(".addFTin").click(function(event){
    //     event.preventDefault();
    //     $.get(e.target.href);
    //     console.log(e.target.href);
    //     e.target.style="pointer-events: none; cursor: default;";
    //     e.target.style="color:red;";
    // });

    /**********************************************************************/

        const alarmList2=document.querySelectorAll('.deleteFT');

        loadEventListener2();
        function loadEventListener2() {
            console.log(alarmList2);
            alarmList2.forEach(function(element) {
                element.addEventListener('click',removeAlarm2);
            });

        }
        function removeAlarm2(e) {
            e.preventDefault();
            console.log('i am hereeeeeeee de!'+e.target.parentElement.href);
            if(e.target.parentElement.classList.contains('deleteFT') ){

                $.get(e.target.parentElement.href);
            }
        }


        // if(e.target.parentElement.classList.contains('delete-alarm') ){
        //     e.target.parentElement.parentElement.remove();
        //     var getUrl= e.target.href;
        //     //var getUrl = window.location.origin + '/alarms/';
        //
        //     $.get(getUrl, function(data){
        //
        //     });
        //
        // }




    /*****************add favourite*******************************/
    // $(".eric-test").click(function (e) {
    //
    //     $.get('http://localhost:3000/api/alarms', function(response) {
    //         var followers = response;
    //
    //         console.log(followers);
    //     });
    // });

    // When the user scrolls down 20px from the top of the document, show the button


    // $(".open-password-form").click(function (e) {
    //     e.preventDefault();
    //     $(".change-password").toggle("slow");
    //
    // });
    // $(".open-profile-form").click(function (e) {
    //     e.preventDefault();
    //     $(".change-password").css('display','none');
    //     $(".personal-info").css('display','block');
    // });
    // let socket = io();
    // let name = '';
    // let nameInput = $('#name-input');
    // let chatInput = $('#chat-input');
    //
    // // handle name entered with via keyboard enter
    // nameInput.keydown(function(event) {
    //     if (event.which == 13) {
    //         event.preventDefault();
    //
    //         // ensure message not empty
    //         if (nameInput.val() !== '') {
    //             name = nameInput.val();
    //             nameInput.val('');
    //             $('.enter-name').hide();
    //             socket.emit('new:member', name);
    //         }
    //     }
    // });
    //
    // // handle name entered with when clicking enter
    // $('.submit-name').on('click', function(event) {
    //     event.preventDefault();
    //
    //     // ensure message not empty
    //     if (nameInput.val() !== '') {
    //         name = nameInput.val();
    //         nameInput.val('');
    //         $('.enter-name').hide();
    //         socket.emit('new:member', name);
    //     }
    // });
    //
    //
    // // handle keyboard enter button being pressed
    // chatInput.keydown(function(event) {
    //     if (event.which == 13) {
    //         event.preventDefault();
    //
    //         // ensure message not empty
    //         if (chatInput.val() !== '' && name !== '') {
    //             socket.emit('new:message', {name: name, msg: chatInput.val()});
    //             chatInput.val('');
    //         }
    //     }
    // });
    //
    // // handle submit chat message button being clicked
    // $('.submit-chat-message').on('click', function(event) {
    //     event.preventDefault();
    //
    //     // ensure message not empty
    //     if (chatInput.val() !== '' && name !== '') {
    //         socket.emit('new:message', {name: name, msg: chatInput.val()});
    //         chatInput.val('');
    //     }
    // });
    //
    // // handle receiving new messages
    // socket.on('new:message', function(msgObject){
    //     $('#messages').append($('<div class="msg new-chat-message">').html('<span class="member-name">' + msgObject.name + '</span>: ' + msgObject.msg));
    //     $('.chat-window').scrollTop($('#messages').height());
    // });
    //
    // // handle members joining
    // socket.on('new:member', function(name){
    //     $('#messages').append($('<div class="msg new-member">').text(name + ' has joined the room'));
    //     $('.chat-window').scrollTop($('#messages').height());
    // });
});
