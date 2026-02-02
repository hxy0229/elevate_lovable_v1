import { useState } from 'react';
import { Music, Users, Drum, Piano, Guitar, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import Layout from '@/components/layout/Layout';

const Rooms = () => {
  const { t, language } = useLanguage();
  const [selectedSize, setSelectedSize] = useState<string>('all');

  const sizeFilters = [
    { id: 'all', label: t('rooms.filter.all') },
    { id: 'small', label: t('rooms.filter.small') },
    { id: 'medium', label: t('rooms.filter.medium') },
    { id: 'large', label: t('rooms.filter.large') },
  ];

  const rooms = [
    {
      id: 1,
      name: language === 'en' ? 'Studio A' : 'A录音室',
      size: 'large',
      capacity: 8,
      equipment: ['drums', 'keyboard', 'amps', 'mics'],
      available: true,
      image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=400',
    },
    {
      id: 2,
      name: language === 'en' ? 'Practice Room 1' : '练习室1',
      size: 'medium',
      capacity: 4,
      equipment: ['keyboard', 'amps', 'mics'],
      available: true,
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    },
    {
      id: 3,
      name: language === 'en' ? 'Practice Room 2' : '练习室2',
      size: 'medium',
      capacity: 4,
      equipment: ['drums', 'amps'],
      available: false,
      image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400',
    },
    {
      id: 4,
      name: language === 'en' ? 'Vocal Booth' : '录音棚',
      size: 'small',
      capacity: 2,
      equipment: ['mics', 'keyboard'],
      available: true,
      image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400',
    },
    {
      id: 5,
      name: language === 'en' ? 'Drum Room' : '鼓房',
      size: 'small',
      capacity: 2,
      equipment: ['drums'],
      available: true,
      image: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=400',
    },
    {
      id: 6,
      name: language === 'en' ? 'Studio B' : 'B录音室',
      size: 'large',
      capacity: 10,
      equipment: ['drums', 'keyboard', 'amps', 'mics'],
      available: true,
      image: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=400',
    },
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

  const filteredRooms = selectedSize === 'all'
    ? rooms
    : rooms.filter((room) => room.size === selectedSize);

  return (
    <Layout>
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
              {t('rooms.title')}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t('rooms.subtitle')}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {sizeFilters.map((filter) => (
              <Button
                key={filter.id}
                variant={selectedSize === filter.id ? 'default' : 'outline'}
                className="rounded-xl"
                onClick={() => setSelectedSize(filter.id)}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Room Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRooms.map((room) => (
              <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="relative h-48">
                  <img
                    src={room.image}
                    alt={room.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge
                    className={`absolute top-4 right-4 ${
                      room.available
                        ? 'bg-green-500'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {room.available ? t('rooms.available') : t('rooms.booked')}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-display text-xl font-semibold mb-2">
                    {room.name}
                  </h3>
                  <div className="flex items-center gap-4 text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{room.capacity} {t('rooms.capacity')}</span>
                    </div>
                    <Badge variant="secondary" className="capitalize">
                      {t(`rooms.filter.${room.size}`)}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {room.equipment.map((equip) => (
                      <div
                        key={equip}
                        className="flex items-center gap-1 px-2 py-1 bg-secondary rounded-lg text-sm"
                      >
                        {getEquipmentIcon(equip)}
                        <span className="capitalize">{equip}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button
                    className="w-full rounded-xl"
                    disabled={!room.available}
                  >
                    {t('rooms.bookNow')}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Rooms;
