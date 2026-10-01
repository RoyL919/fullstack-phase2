import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Groups } from './groups';
import { provideRouter } from '@angular/router';

describe('Groups', () => {
  let component: Groups;
  let fixture: ComponentFixture<Groups>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Groups],
      providers: [
        provideRouter([
          {
            path: 'chat/:channelId/:channelName',
            component: Groups
          }
        ])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Groups);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
