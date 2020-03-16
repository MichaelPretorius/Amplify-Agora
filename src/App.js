import React, { useState, useEffect, createContext } from 'react';
import { API, graphqlOperation, Auth, Hub } from 'aws-amplify';
import { Authenticator, AmplifyTheme } from 'aws-amplify-react';
import { Router, Route } from 'react-router-dom';
import { createBrowserHistory } from 'history';
import { getUser } from './graphql/queries';
import { registerUser } from './graphql/mutations';
import HomePage from './pages/HomePage';
import MarketPage from './pages/MarketPage';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/Navbar';
import './App.css';

export const history =  createBrowserHistory();

export const UserContext = createContext();

const App = () => {
  const [user, setuser] = useState( null );
  const [userAttributes, setuserAttributes] = useState( null );

  useEffect(() => {
    getUserData();
    Hub.listen('auth', onHubCapsule);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    user && getUserAttributes(user)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])
  
  const getUserData = async () => {
    const user = await Auth.currentAuthenticatedUser();
    user ? setuser(user) : setuser(null);
  };

  const getUserAttributes = async authUserData => {
    const attributesArr = await Auth.userAttributes(authUserData);
    const attributesObj = Auth.attributesToObject(attributesArr);
    setuserAttributes(attributesObj);
  }

  const handleSignOut = async () => {
    try {
      await Auth.signOut();
    } catch (err) {
      console.log('Error signing out user: ', err)
    }
  }

  const registerNewUser = async signInData=> {
    const getUserInput = {
      id: signInData.signInUserSession.idToken.payload.sub
    };
    const { data } = await API.graphql(graphqlOperation(getUser, getUserInput));

    if (!data.getUser) {
      try {
        const registerUserInput = {
          ...getUserInput,
          userName: signInData.username,
          email: signInData.signInUserSession.idToken.payload.email,
          registered: true
        }
        const newUser = await API.graphql(graphqlOperation(registerUser, { input: registerUserInput }))
        console.log({ newUser })
      } catch (error) {
        console.log('Error registering new user: ', error)
      }
    }
  }

  const onHubCapsule = capsule => {
    switch (capsule.payload.event) {
      case 'signIn':
        getUserData();
        registerNewUser(capsule.payload.data);
        break;
      case 'signUp':
        break;
      case 'signOut':
        setuser(null);
        break;
      default:
        break;
    }
  }

  return (
		<>
			{!user ? (
				<Authenticator theme={theme} />
			) : (
				<UserContext.Provider value={{user, userAttributes}}>
					<Router history={history}>
						<Navbar user={user} handleSignOut={handleSignOut} />
						<div className='app-container'>
							<Route exact path='/' component={HomePage} />
							<Route exact path='/profile' component={() => <ProfilePage user={user} userAttributes={userAttributes} />} />
							<Route
								exact
								path='/markets/:marketId'
								component={({match}) => (
                  <MarketPage user={user} match={match} userAttributes={userAttributes} />
								)}
							/>
						</div>
					</Router>
				</UserContext.Provider>
			)}
		</>
	);
}

const theme = {
  ...AmplifyTheme,
  navBar: {
    ...AmplifyTheme.navBar,
    backgroundColor: '#ffc0cb'
  },
  button: {
    ...AmplifyTheme.button,
    backgroundColor: 'var(--amazonOrange)'
  },
  sectionBody: {
    ...AmplifyTheme.sectionBody,
    padding: '5px',
  },
  sectionHeader: {
    ...AmplifyTheme.sectionHeader,
    backgroundColor: 'var(--squidInk)',
  }
}

// export default withAuthenticator(App, true, [], null, theme);
export default App;