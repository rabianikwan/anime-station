import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import prismadb from "@/lib/prismadb";
import { compare } from 'bcrypt';

export default NextAuth({
    // making credential for email and password
    providers: [
        Credentials({
            id: 'credentials',
            name: 'Credentials',
            credentials : {
                email: {
                    label: 'Email',
                    type: 'text',
                },
                password: {
                    label: 'Password',
                    type: 'password'
                }
            },
            // function to check if email or password is null
            async authorize(credentials){
                if(!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password required")
                }

                // check if email is has been taken
                const user = await prismadb.user.findUnique(({
                    where: {
                        email: credentials.email
                    }
                }));


                // conditional if wrong email has been filled in box
                if(!user || !user.hashedPassword) {
                    throw new Error("Email is not Exist")
                }

                // check password and return into boolean
                const isCorrectPassword = await compare(
                    credentials.password,
                    user.hashedPassword
                );

                // conditional if password is wrong
                if (!isCorrectPassword) {
                    throw new Error("incorrect password")
                }

                return user;
            }
        })
    ],
    pages: {
        signIn: '/auth',
    },
    debug: process.env.NODE_ENV === 'development',
    session: {
        strategy: 'jwt'
    },
    jwt : {
        secret: process.env.NEXTAUTH_JWT_SECRET
    },
    secret : process.env.NEXTAUTH_SECRET
});
