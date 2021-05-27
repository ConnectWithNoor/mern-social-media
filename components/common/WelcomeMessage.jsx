import { Icon, Message, Divider } from 'semantic-ui-react';
import { useRouter } from 'next/router';
import Link from 'next/link';

export const HeaderMessage = () => {
  const router = useRouter();
  const signupRoute = router.pathname === '/signup';

  const renderMessage = signupRoute ? 'Get Started' : 'Welcome Back';
  const renderIcon = signupRoute ? 'settings' : 'privacy';
  const renderContent = signupRoute
    ? 'Create New Account'
    : 'Login with Email and Password';

  return (
    <Message
      attached
      color='teal'
      header={renderMessage}
      icon={renderIcon}
      content={renderContent}
    />
  );
};

export const FooterMessage = () => {
  const router = useRouter();
  const signupRoute = router.pathname === '/signup';

  return (
    <>
      {signupRoute ? (
        <>
          <Message attached='bottom' warning>
            <Icon name='help' />
            Existing User ?<Link href='/login'>Login Here Instead</Link>
          </Message>
          <Divider hidden />
        </>
      ) : (
        <>
          <Message attached='bottom' warning>
            <Icon name='lock' />
            <Link href='/reset'>Forget Password</Link>
          </Message>

          <Message attached='bottom' warning>
            <Icon name='help' />
            New User ? <Link href='/signup'>Signup Here Instead</Link>
          </Message>
        </>
      )}
    </>
  );
};
