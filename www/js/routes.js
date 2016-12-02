angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

        
    .state('login', {
	  
      url: '/page1',
      templateUrl: 'templates/login.html',
      controller: 'loginCtrl'
    })
	
        
    .state('synchronized', {
	 
      url: '/page2',
      templateUrl: 'templates/synchronized.html',
      controller: 'synchronizedCtrl'
    })
      
        
    .state('menu.setting', {
	
      url: '/page3',
		views: {
        'side-menu21': {
			templateUrl: 'templates/setting.html',
			controller: 'settingCtrl'
	    }
      }
    })
      
        
    .state('menu.chooseLocation', {
	
      url: '/page4',
      views: {
        'side-menu21': {
          templateUrl: 'templates/chooseLocation.html',
          controller: 'chooseLocationCtrl'
        }
      }
    })
          
      
    .state('menu', {
		
      url: '/side-menu21',
      abstract:true,
      templateUrl: 'templates/menu.html'
	  /* controller: 'menuCtrl' */
    })
      
    
        
    .state('menu.allLocationOutBox', {
	
      url: '/page5',
      views: {
        'side-menu21': {
          templateUrl: 'templates/allLocationOutBox.html',
          controller: 'allLocationOutBoxCtrl'
        }
      }
    })
        
        
    .state('menu.selectedIndicador', {
		
      url: '/page7',
	  views: {
		  'side-menu21': {
			templateUrl: 'templates/selectedIndicador.html',
			controller: 'selectedIndicadorCtrl'
	    }
      }
    })
        
        
    .state('drafts', {
		
      url: '/page8',
      templateUrl: 'templates/drafts.html',
      controller: 'draftsCtrl'
    })
        
        
    .state('graphic', {
	
      url: '/page9',
      templateUrl: 'templates/graphic.html',
      controller: 'graphicCtrl'
    })
        
        
    .state('score', {
		
      url: '/page10',
      templateUrl: 'templates/score.html',
      controller: 'scoreCtrl'
    })
        
        
    .state('survey', {
	
      url: '/page11',
      templateUrl: 'templates/survey.html',
      controller: 'surveyCtrl'
    })
        
    .state('finalScoreSurvey', {
		
      url: '/page12',
      templateUrl: 'templates/finalScoreSurvey.html',
      controller: 'finalScoreSurveyCtrl'
    })
	
	.state('logout', {
	  
      url: '/page13',
      templateUrl: 'templates/logout.html',
      controller: 'logoutCtrl'
    })
    
   .state('surveyEdit', {
	  
      url: '/page14',
      templateUrl: 'templates/surveyEdit.html',
      controller: 'surveyEditCtrl'
    })
	
	.state('photos',{
		url: '/page15',
		templateUrl: 'templates/photos.html',
		 controller: 'photoCtrl'
	})

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/page1');

});