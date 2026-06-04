import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';


@Injectable()
export class AuthService {
    private supabase;
    constructor(){
        this.supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_ANON_KEY!
        );
    }

    async verifyToken(token: string){
        const {data:{user}} = await this.supabase.auth.getUser(token);

        if (!user) throw new Error('Invalid token');

        return user;
    }
    
}
