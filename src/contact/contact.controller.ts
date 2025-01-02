import { Public } from '#/auth/decorators/public.decorators';
import { Body, Controller, Post } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactDto } from './dto/contact.dto';

@Controller('contacts')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Public()
  @Post()
  async sendToEmail(@Body() contactDto: ContactDto) {
    return await this.contactService.send(contactDto);
  }
}
