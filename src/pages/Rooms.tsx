import { useState } from 'react';
import { Music, Users, Drum, Piano, Guitar, Mic, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';

const Rooms = () => {
  const { t, language } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<string>('');

  const room = {
    name: t('rooms.roomName'),
    description: t('rooms.roomDesc'),
    capacity: 8,
    equipment: ['drums', 'keyboard', 'amps', 'mics'],
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800',
  };

  // Generate next 7 days
  const getNextDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        label: language === 'zh' 
          ? date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'short' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' }),
      });
    }
    return days;
  };

  const days = getNextDays();

  // Mock time slots
  const timeSlots = [
    { time: '10:00 - 12:00', available: true },
    { time: '12:00 - 14:00', available: false },
    { time: '14:00 - 16:00', available: true },
    { time: '16:00 - 18:00', available: true },
    { time: '18:00 - 20:00', available: false },
    { time: '20:00 - 22:00', available: true },
  ];

  const getEquipmentIcon = (equip: string) => {
    switch (equip) {
      case 'drums':
        return <Drum className="w-4 h-4" />;
      case 'keyboard':
        return <Piano className="w-4 h-4" />;
      case 'amps':
        return <Guitar className="w-4 h-4" />;
      case 'mics':
        return <Mic className="w-4 h-4" />;
      default:
        return <Music className="w-4 h-4" />;
    }
  };

  return (
    <Layout>
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 text-gradient">
              {t('rooms.title')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('rooms.subtitle')}
            </p>
            <div className="w-16 h-1 bg-primary mx-auto rounded-full mt-6" />
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Room Card */}
            <Card className="overflow-hidden border-border mb-8">
              <div className="grid md:grid-cols-2">
                <div className="relative h-64 md:h-auto">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent md:bg-gradient-to-r" />
                </div>
                <CardContent className="p-8">
                  <h3 className="font-display text-2xl font-semibold mb-2">
                    {room.name}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {room.description}
                  </p>
                  
                  <div className="flex items-center gap-2 mb-6 text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>{room.capacity} {t('rooms.capacity')}</span>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">{t('rooms.equipment')}:</p>
                    <div className="flex flex-wrap gap-2">
                      {room.equipment.map((equip) => (
                        <div
                          key={equip}
                          className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg text-sm border border-border"
                        >
                          {getEquipmentIcon(equip)}
                          <span className="capitalize">{equip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </div>
            </Card>

            {/* Date Selection */}
            <Card className="border-border mb-8">
              <CardHeader>
                <CardTitle className="font-display text-xl flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  {t('rooms.selectDate')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {days.map((day) => (
                    <Button
                      key={day.date}
                      variant={selectedDate === day.date ? 'default' : 'outline'}
                      className={`flex-shrink-0 rounded-xl h-auto py-3 px-4 ${
                        selectedDate === day.date ? 'gold-glow' : ''
                      }`}
                      onClick={() => setSelectedDate(day.date)}
                    >
                      <span className="text-sm">{day.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Time Slots */}
            {selectedDate && (
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="font-display text-xl flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    {t('rooms.timeSlots')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {timeSlots.map((slot, index) => (
                      <Button
                        key={index}
                        variant={slot.available ? 'outline' : 'secondary'}
                        disabled={!slot.available}
                        className={`h-auto py-4 rounded-xl ${
                          slot.available ? 'hover:border-primary/50' : 'opacity-50'
                        }`}
                      >
                        <div className="text-center">
                          <p className="font-semibold">{slot.time}</p>
                          <Badge 
                            variant={slot.available ? 'default' : 'secondary'}
                            className="mt-2 text-xs"
                          >
                            {slot.available ? t('rooms.available') : t('rooms.booked')}
                          </Badge>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button className="w-full rounded-full h-12 font-semibold gold-glow">
                    {t('rooms.bookNow')}
                  </Button>
                </CardFooter>
              </Card>
            )}

            {!selectedDate && (
              <Card className="border-border">
                <CardContent className="p-12 text-center">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">{t('rooms.selectDate')}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Rooms;
