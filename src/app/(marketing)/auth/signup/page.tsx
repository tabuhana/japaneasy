import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { SignupForm } from '../../components/signup-form';

export default function SignUpPage() {
  return (
    <Card className='mx-auto mt-10 w-full max-w-md'>
      <CardHeader>
        <CardTitle className='font-cherry-bomb text-center text-4xl'>Sign Up</CardTitle>
      </CardHeader>
      <CardContent>
        <SignupForm />
      </CardContent>
    </Card>
  );
}
