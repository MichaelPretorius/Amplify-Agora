import React, { useState, useEffect, createContext } from 'react';
import { API, graphqlOperation, Auth, Hub } from 'aws-amplify';
import { Authenticator, AmplifyTheme } from 'aws-amplify-react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { getUser } from './graphql/queries';
import { registerUser } from './graphql/mutations';
import HomePage from './pages/HomePage';
import MarketPage from './pages/MarketPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';
import Navbar from './components/Navbar';

export const UserContext = createContext();

const App = () => {
  const [user, setuser] = useState( null );

  useEffect(() => {
    getUserData();
    Hub.listen('auth', onHubCapsule);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const getUserData = async () => {
    const user = await Auth.currentAuthenticatedUser();
    user ? setuser(user) : setuser(null);
  };

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
				<UserContext.Provider value={{user}}>
					<Router>
						<Navbar user={user} handleSignOut={handleSignOut} />
						<div className='app-container'>
							<Route exact path='/' component={HomePage} />
							<Route exact path='/profile' component={ProfilePage} />
							<Route
								exact
								path='/markets/:marketId'
								component={({match}) => (
									<MarketPage user={user} match={match} />
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