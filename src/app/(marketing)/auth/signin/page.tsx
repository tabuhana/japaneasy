import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { SigninForm } from '../../components/signin-form';

export default function SignInPage() {
  return (
    <Card className='mx-auto mt-10 w-full max-w-md'>
      <CardHeader>
        <CardTitle className='font-cherry-bomb text-center text-4xl'>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <SigninForm />
      </CardContent>
    </Card>
  );
}
