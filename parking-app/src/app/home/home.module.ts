import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from '../shared/components/header/header/header.component';
import { BottomTabsComponent } from '../shared/components/bottom-tabs/bottom-tabs/bottom-tabs.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderComponent,
    BottomTabsComponent,

    HttpClientModule,


    HomePageRoutingModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
